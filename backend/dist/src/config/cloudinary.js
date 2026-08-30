"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinaryConfigurationStatus = void 0;
const cloudinary_1 = require("cloudinary");
const PLACEHOLDER_PATTERN = /^(?:your_|replace_|example|xxx|change_me)|(?:_here)$/i;
const normalize = (value) => value?.trim() ?? '';
const isUsableCredential = (value) => value.length > 0 && !PLACEHOLDER_PATTERN.test(value);
const parseCloudinaryUrl = (value) => {
    if (!value)
        return null;
    try {
        const parsed = new URL(value);
        if (parsed.protocol !== 'cloudinary:')
            return null;
        const credentials = {
            cloudName: decodeURIComponent(parsed.hostname),
            apiKey: decodeURIComponent(parsed.username),
            apiSecret: decodeURIComponent(parsed.password),
        };
        return Object.values(credentials).every(isUsableCredential) ? credentials : null;
    }
    catch {
        return null;
    }
};
const cloudinaryUrl = normalize(process.env.CLOUDINARY_URL);
const urlCredentials = parseCloudinaryUrl(cloudinaryUrl);
const individualCredentials = {
    cloudName: normalize(process.env.CLOUDINARY_CLOUD_NAME),
    apiKey: normalize(process.env.CLOUDINARY_API_KEY),
    apiSecret: normalize(process.env.CLOUDINARY_API_SECRET),
};
const individualEntries = [
    ['CLOUDINARY_CLOUD_NAME', individualCredentials.cloudName],
    ['CLOUDINARY_API_KEY', individualCredentials.apiKey],
    ['CLOUDINARY_API_SECRET', individualCredentials.apiSecret],
];
const invalidIndividualKeys = individualEntries
    .filter(([, value]) => !isUsableCredential(value))
    .map(([key]) => key);
const individualCredentialsAreValid = invalidIndividualKeys.length === 0;
const resolvedCredentials = urlCredentials
    ?? (individualCredentialsAreValid ? individualCredentials : null);
exports.cloudinaryConfigurationStatus = {
    configured: resolvedCredentials !== null,
    source: urlCredentials
        ? 'CLOUDINARY_URL'
        : individualCredentialsAreValid
            ? 'individual_variables'
            : null,
    invalidKeys: resolvedCredentials
        ? []
        : cloudinaryUrl
            ? ['CLOUDINARY_URL', ...invalidIndividualKeys]
            : invalidIndividualKeys,
};
cloudinary_1.v2.config({
    ...(resolvedCredentials && {
        cloud_name: resolvedCredentials.cloudName,
        api_key: resolvedCredentials.apiKey,
        api_secret: resolvedCredentials.apiSecret,
    }),
    secure: true,
});
exports.default = cloudinary_1.v2;
//# sourceMappingURL=cloudinary.js.map