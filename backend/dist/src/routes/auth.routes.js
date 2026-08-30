"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = require("crypto");
const passport_1 = __importStar(require("../config/passport"));
const constants_1 = require("../constants");
const authController = __importStar(require("../controllers/auth.controller"));
const validate_middleware_1 = require("../middlewares/validate.middleware");
const response_utils_1 = require("../utils/response.utils");
const auth_cookie_utils_1 = require("../utils/auth-cookie.utils");
const auth_validator_1 = require("../validators/auth.validator");
const router = (0, express_1.Router)();
const requireGoogleConfig = (_req, res, next) => {
    if (!passport_1.googleOAuthConfigured) {
        (0, response_utils_1.sendError)(res, 'Google OAuth chưa được cấu hình', constants_1.HTTP_STATUS.SERVICE_UNAVAILABLE);
        return;
    }
    next();
};
const googleFailureRedirect = process.env.GOOGLE_OAUTH_FAILURE_REDIRECT?.trim() ||
    `${process.env.FRONTEND_URL?.trim() || 'http://localhost:5173'}/login?oauth=failed`;
const beginGoogleOAuth = (req, res, next) => {
    const state = (0, crypto_1.randomBytes)(32).toString('hex');
    (0, auth_cookie_utils_1.setGoogleOAuthStateCookie)(res, state);
    passport_1.default.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
        state,
    })(req, res, next);
};
const verifyGoogleOAuthState = (req, res, next) => {
    const expectedState = (0, auth_cookie_utils_1.getGoogleOAuthStateFromRequest)(req);
    const returnedState = typeof req.query.state === 'string' ? req.query.state : null;
    (0, auth_cookie_utils_1.clearGoogleOAuthStateCookie)(res);
    if (!expectedState || !returnedState) {
        res.redirect(googleFailureRedirect);
        return;
    }
    const expected = Buffer.from(expectedState);
    const returned = Buffer.from(returnedState);
    if (expected.length !== returned.length || !(0, crypto_1.timingSafeEqual)(expected, returned)) {
        res.redirect(googleFailureRedirect);
        return;
    }
    next();
};
router.post('/register', (0, validate_middleware_1.validate)(auth_validator_1.registerSchema), authController.register);
router.post('/login', (0, validate_middleware_1.validate)(auth_validator_1.loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/google', requireGoogleConfig, beginGoogleOAuth);
router.get('/google/callback', requireGoogleConfig, verifyGoogleOAuthState, passport_1.default.authenticate('google', { session: false, failureRedirect: googleFailureRedirect }), authController.googleCallback);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map