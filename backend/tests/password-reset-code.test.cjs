const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'isolated-code-test-access-secret';
process.env.JWT_REFRESH_SECRET = 'isolated-code-test-refresh-secret';
process.env.REDIS_URL = 'redis://127.0.0.1:1';
process.env.RESEND_API_KEY = '';
const bcrypt = require('bcryptjs');
const { PasswordResetCodeService, RESET_CODE_ERROR } = require('../dist/src/services/password-reset-code.service');
const { createGmailCodeSender, renderResetCodeMail } = require('../dist/src/services/gmail-password-reset-mail.service');
const { verifyResetCodeSchema, resetPasswordWithCodeSchema, forgotPasswordSchema, resetPasswordSchema } = require('../dist/src/validators/auth.validator');

// Transactional in-memory test double: failures restore state and concurrent callers serialize.
// No test in this file opens a PostgreSQL, Redis or Gmail connection.
async function fixture(options = {}) {
  const user = { id: 71, email: 'traveler@gmail.com', fullName: 'Khách Việt', authProvider: 'LOCAL', isActive: true, role: 'USER', avatarUrl: null, passwordHash: await bcrypt.hash('OldPassword1', 4), ...options.user };
  let state = { users: [user], codes: [], links: [{ userId: 71, usedAt: null }], refresh: [{ userId: 71 }] };
  const sent = [], revoked = [], queries = [];
  let time = Date.parse('2026-10-24T09:00:00Z'), tail = Promise.resolve(), failPasswordWrite = false;
  const matches = (record, where) => Object.entries(where).every(([key,value]) => {
    if (value && typeof value === 'object') {
      if ('gt' in value) return record[key] > value.gt;
      if ('lt' in value) return record[key] < value.lt;
    }
    return record[key] === value;
  });
  const apply = (record, data) => { for (const [key,value] of Object.entries(data)) record[key] = value && typeof value === 'object' && 'increment' in value ? record[key] + value.increment : value; };
  const db = {
    $queryRaw: async (strings, ...values) => {
      queries.push({ text: strings.join('?'), values });
      return state.users.filter(item=>item.email===values[0]).map(item=>({id:item.id}));
    },
    user: {
      findUnique: async ({where}) => structuredClone(state.users.find(item=>matches(item,where)) || null),
      update: async ({where,data}) => { if (failPasswordWrite) throw new Error('simulated write failure'); const item=state.users.find(item=>matches(item,where)); apply(item,data); return item; },
    },
    passwordResetCode: {
      findUnique: async ({where}) => structuredClone(state.codes.find(item=>matches(item,where)) || null),
      upsert: async ({where,create,update}) => { const item=state.codes.find(item=>matches(item,where)); if(item)apply(item,update);else state.codes.push(structuredClone(create)); },
      update: async ({where,data}) => { const item=state.codes.find(item=>matches(item,where));assert(item);apply(item,data);return item; },
      updateMany: async ({where,data}) => { const items=state.codes.filter(item=>matches(item,where));items.forEach(item=>apply(item,data));return{count:items.length}; },
    },
    passwordResetToken: { updateMany: async ({where,data}) => { const items=state.links.filter(item=>matches(item,where));items.forEach(item=>apply(item,data));return{count:items.length}; } },
    refreshToken: { deleteMany: async ({where}) => { const before=state.refresh.length;state.refresh=state.refresh.filter(item=>!matches(item,where));return{count:before-state.refresh.length}; } },
    $transaction: (fn) => { const task=tail.then(async()=>{const snapshot=structuredClone(state);try{return await fn(db);}catch(error){state=snapshot;throw error;}});tail=task.catch(()=>{});return task; },
  };
  const service = new PasswordResetCodeService({ db, send: options.send || (async params=>{sent.push(params);return true;}), revoke: async id=>revoked.push(id), now:()=>time, secret:'isolated-HMAC-secret', ttlSeconds:300, resendSeconds:60, maxAttempts:5 });
  return { service, db, sent, revoked, queries, state:()=>state, advance: ms=>{time+=ms;}, failWrite:()=>{failPasswordWrite=true;}, email:user.email };
}
const tick = () => new Promise(resolve=>setImmediate(resolve));
const wrongCode = code => String((Number(code)+1)%1000000).padStart(6,'0');
const rejectCode = promise => assert.rejects(promise, error=>error.statusCode===400&&error.message===RESET_CODE_ERROR);
const ready = async f => { await f.service.requestCode(f.email); const code=f.sent.at(-1).code; const grant=await f.service.verifyCode({email:f.email,code});return{email:f.email,code,...grant,password:'NewPassword2',confirmPassword:'NewPassword2'}; };

test('requests are identical for eligible, unknown, locked and OAuth-only email accounts', async()=>{
  const normal=await fixture();const expected=await normal.service.requestCode(normal.email);
  assert.equal(normal.sent.length,1);assert.match(normal.sent[0].code,/^\d{6}$/);
  assert.deepEqual(await normal.service.requestCode('unknown@gmail.com'),expected);
  for(const user of [{isActive:false},{authProvider:'GOOGLE',passwordHash:null},{authProvider:'FACEBOOK',passwordHash:null}]){
    const f=await fixture({user});assert.deepEqual(await f.service.requestCode(f.email),expected);assert.equal(f.sent.length,0);assert.equal(f.state().codes.length,0);
  }
  assert.deepEqual(Object.keys(expected).sort(),['expiresInSeconds','message','resendAfterSeconds']);
});

test('only HMAC digest is stored; row lock uses a parameterized normalized email',async()=>{
  const f=await fixture();await f.service.requestCode('  TRAVELER@GMAIL.COM  ');
  const record=f.state().codes[0];assert.match(record.codeHash,/^[a-f0-9]{64}$/);
  assert.notEqual(record.codeHash,createHash('sha256').update(f.sent[0].code).digest('hex'));
  assert.equal(record.code,undefined);assert.equal(record.expiresAt-record.createdAt,300000);
  assert.match(f.queries[0].text,/FOR UPDATE/);assert.deepEqual(f.queries[0].values,[f.email]);
});

test('concurrent resends issue one code; next code after 60 seconds invalidates previous code and grant',async()=>{
  const f=await fixture();await Promise.all(Array.from({length:8},()=>f.service.requestCode(f.email)));assert.equal(f.sent.length,1);
  const old=await ready(f);f.advance(60000);await f.service.requestCode(f.email);assert.equal(f.sent.length,2);
  assert.notEqual(f.sent[0].code,f.sent[1].code);await rejectCode(f.service.resetPassword(old));
  assert.equal(f.state().codes.length,1);assert.equal(f.state().codes[0].attempts,1);
});

test('five concurrent incorrect attempts persist and lock even the correct code',async()=>{
  const f=await fixture();await f.service.requestCode(f.email);const code=f.sent[0].code;
  const outcomes=await Promise.allSettled(Array.from({length:7},()=>f.service.verifyCode({email:f.email,code:wrongCode(code)})));
  assert(outcomes.every(item=>item.status==='rejected'));assert.equal(f.state().codes[0].attempts,5);
  await rejectCode(f.service.verifyCode({email:f.email,code}));
});

test('code expiry is enforced both during verification and final password update',async()=>{
  const f=await fixture();const payload=await ready(f);f.advance(300000);
  await rejectCode(f.service.verifyCode(payload));await rejectCode(f.service.resetPassword(payload));
  assert.equal(await bcrypt.compare('OldPassword1',f.state().users[0].passwordHash),true);
});

test('final reset cannot skip verification or reuse a grant with a different code/email',async()=>{
  const f=await fixture();await f.service.requestCode(f.email);const code=f.sent[0].code;
  const payload={email:f.email,code,resetToken:'a'.repeat(64),password:'NewPassword2',confirmPassword:'NewPassword2'};
  await rejectCode(f.service.resetPassword(payload));
  const grant=await f.service.verifyCode(payload);
  await rejectCode(f.service.resetPassword({...payload,...grant,email:'other@gmail.com'}));
  await rejectCode(f.service.resetPassword({...payload,...grant,code:wrongCode(code)}));
  assert.equal(f.state().codes[0].attempts,1);assert.equal(f.state().codes[0].resetTokenHash,null);
});

test('successful reset is one-use, preserves profile, hashes at cost 12 and allows existing login service to authenticate',async(t)=>{
  const f=await fixture();const before=structuredClone(f.state().users[0]);const payload=await ready(f);
  const results=await Promise.allSettled([f.service.resetPassword(payload),f.service.resetPassword(payload)]);
  assert.equal(results.filter(item=>item.status==='fulfilled').length,1);
  const user=f.state().users[0];assert.equal(bcrypt.getRounds(user.passwordHash),12);
  assert.equal(await bcrypt.compare(payload.password,user.passwordHash),true);
  assert.equal(await bcrypt.compare('OldPassword1',user.passwordHash),false);
  assert.deepEqual({...user,passwordHash:before.passwordHash},before);assert.deepEqual(f.revoked,[71]);
  assert(f.state().codes[0].usedAt);assert(f.state().links[0].usedAt);assert.equal(f.state().refresh.length,0);
  const repository=require('../dist/src/repositories/user.repository');const sessions=require('../dist/src/utils/token-session');
  t.mock.method(repository,'findByEmail',async()=>user);t.mock.method(sessions,'setSession',async()=>{});
  const auth=require('../dist/src/services/auth.service');
  assert.equal((await auth.login({email:f.email,password:payload.password})).user.id,user.id);
  await assert.rejects(auth.login({email:f.email,password:'OldPassword1'}),error=>error.statusCode===401);
});

test('password write failure rolls back code consumption, legacy token invalidation and session changes',async()=>{
  const f=await fixture();const payload=await ready(f);const before=structuredClone(f.state());f.failWrite();
  await assert.rejects(f.service.resetPassword(payload));assert.deepEqual(f.state(),before);assert.deepEqual(f.revoked,[]);
});

test('another password change invalidates the outstanding code without changing legacy flow',async()=>{
  const f=await fixture();const payload=await ready(f);f.state().users[0].passwordHash=await bcrypt.hash('OtherPassword3',4);
  await rejectCode(f.service.resetPassword(payload));
});

test('delivery failure returns the same generic response and invalidates only its generation',async()=>{
  const deliveries=[];const f=await fixture({send:()=>new Promise(resolve=>{deliveries.push(resolve);})});
  const response=await f.service.requestCode(f.email);const first=f.state().codes[0].id;
  f.advance(60000);await f.service.requestCode(f.email);const second=f.state().codes[0].id;assert.notEqual(first,second);
  deliveries[0](false);await tick();assert.equal(f.state().codes[0].id,second);assert.equal(f.state().codes[0].usedAt,null);deliveries[1](true);
  const failed=await fixture({send:async()=>false});assert.deepEqual(await failed.service.requestCode(failed.email),response);await tick();assert(failed.state().codes[0].usedAt);
});

test('SMTP delivery does not delay the public request response',async()=>{
  let finish;const f=await fixture({send:()=>new Promise(resolve=>{finish=resolve;})});
  const response=await f.service.requestCode(f.email);assert.equal(response.resendAfterSeconds,60);finish(true);await tick();
});

test('new validators reject missing proof, malformed codes, weak/mismatched passwords and unknown fields; old contracts still validate',()=>{
  assert.equal(verifyResetCodeSchema.safeParse({email:'a@gmail.com',code:'012345'}).success,true);
  assert.equal(verifyResetCodeSchema.safeParse({email:'a@gmail.com',code:123456}).success,false);
  const payload={email:'a@gmail.com',code:'012345',resetToken:'a'.repeat(64),password:'Password1',confirmPassword:'Password1'};
  for(const changed of [{resetToken:undefined},{code:'12345'},{code:'abcdef'},{password:'weak'},{confirmPassword:'different'},{userId:10}])assert.equal(resetPasswordWithCodeSchema.safeParse({...payload,...changed}).success,false);
  assert.equal(forgotPasswordSchema.safeParse({email:'a@gmail.com'}).success,true);
  assert.equal(resetPasswordSchema.safeParse({token:'old-link-token',password:'Password1',confirmPassword:'Password1'}).success,true);
});

test('email templates escape names and clearly state code expiry and non-sharing warning',()=>{
  const mail=renderResetCodeMail({to:'a@gmail.com',code:'012345',recipientName:'<img onerror=bad>',expiresMinutes:5});
  assert(mail.html.includes('&lt;img onerror=bad&gt;'));assert(!mail.html.includes('<img onerror=bad>'));
  assert(mail.text.includes('012345'));assert(mail.text.includes('5 phút'));assert(mail.text.includes('Không chia sẻ'));
});

test('Gmail API uses HTTPS OAuth and MIME without exposing credentials or code in URL',async()=>{
  const calls=[];
  const sender=createGmailCodeSender({PASSWORD_RESET_MAIL_PROVIDER:'gmail-api',GMAIL_USER:'system@gmail.com',GMAIL_APP_PASSWORD:'',GMAIL_OAUTH_CLIENT_ID:'client',GMAIL_OAUTH_CLIENT_SECRET:'secret',GMAIL_OAUTH_REFRESH_TOKEN:'refresh'},async(url,init)=>{
    calls.push({url,init});return new Response(JSON.stringify(calls.length===1?{access_token:'access'}:{id:'sent'}),{status:200});
  });
  assert.equal(await sender({to:'traveler@gmail.com',code:'012345',recipientName:'Khách Việt',expiresMinutes:5}),true);
  assert.equal(calls[0].url,'https://oauth2.googleapis.com/token');assert.equal(calls[1].url,'https://gmail.googleapis.com/gmail/v1/users/me/messages/send');
  const message=Buffer.from(JSON.parse(calls[1].init.body).raw,'base64url').toString('utf8');
  assert(message.includes('multipart/alternative'));assert(message.includes('system@gmail.com'));assert(message.includes('traveler@gmail.com'));
  assert(!message.includes('refresh'));assert(!message.includes('secret'));
});

test('mail provider exceptions use fixed logs with no raw credentials, codes, or recipient',async(t)=>{
  const logs=[];t.mock.method(console,'warn',(...values)=>logs.push(values.join(' ')));
  const sender=createGmailCodeSender({PASSWORD_RESET_MAIL_PROVIDER:'gmail-api',GMAIL_USER:'system@gmail.com',GMAIL_APP_PASSWORD:'',GMAIL_OAUTH_CLIENT_ID:'client',GMAIL_OAUTH_CLIENT_SECRET:'secret-value',GMAIL_OAUTH_REFRESH_TOKEN:'refresh-value'},async()=>{throw new Error('secret-value 012345 traveler@gmail.com');});
  assert.equal(await sender({to:'traveler@gmail.com',code:'012345',recipientName:'Khách',expiresMinutes:5}),false);
  assert(!logs.join(' ').match(/secret-value|012345|traveler@gmail.com/));
});

test('actual auth routes validate DTOs, limit requests, preserve link endpoints and complete code reset',async(t)=>{
  require('express-async-errors');
  const express=require('express');const router=require('../dist/src/routes/auth.routes').default;
  const {errorHandler}=require('../dist/src/middlewares/errorHandler.middleware');
  const {passwordResetCodeService}=require('../dist/src/services/password-reset-code.service');
  const {passwordResetService}=require('../dist/src/services/password-reset.service');
  const f=await fixture();
  for(const method of ['requestCode','verifyCode','resetPassword'])t.mock.method(passwordResetCodeService,method,f.service[method].bind(f.service));
  t.mock.method(passwordResetService,'validateResetToken',async()=>({valid:true}));
  const app=express();app.use(express.json());app.use('/auth',router);app.use(errorHandler);
  const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
  try{
    const post=async(route,data)=>{
      const response=await fetch(`http://127.0.0.1:${server.address().port}/auth${route}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      return{status:response.status,body:await response.json(),headers:response.headers};
    };
    assert.equal((await post('/forgot-password/code',{email:'invalid'})).status,422);
    const request=await post('/forgot-password/code',{email:f.email});assert.equal(request.status,200);
    assert.deepEqual((await post('/forgot-password/code',{email:'unknown@gmail.com'})).body,request.body);
    assert.equal((await post('/reset-password/code',{email:f.email,code:f.sent[0].code,password:'Password1',confirmPassword:'Password1'})).status,422);
    const verified=await post('/reset-password/code/verify',{email:f.email,code:f.sent[0].code});assert.equal(verified.status,200);
    const payload={email:f.email,code:f.sent[0].code,resetToken:verified.body.data.resetToken,password:'Password2',confirmPassword:'Password2'};
    assert.equal((await post('/reset-password/code',payload)).status,200);
    assert.equal((await post('/reset-password/code',payload)).status,400);
    assert.equal((await post('/reset-password/validate',{token:'existing-link'})).body.data.valid,true);
    await post('/forgot-password/code',{email:f.email});await post('/forgot-password/code',{email:f.email});
    const limited=await post('/forgot-password/code',{email:f.email});assert.equal(limited.status,429);assert(limited.headers.get('retry-after'));
    for(let i=0;i<7;i++)await post('/reset-password/code/verify',{email:f.email,code:'000000'});
    assert.equal((await post('/reset-password/code/verify',{email:f.email,code:'000000'})).status,429);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
