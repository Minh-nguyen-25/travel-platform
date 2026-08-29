import { v2 as cloudinary } from 'cloudinary';

type CloudinaryCredentials = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

export interface CloudinaryConfigurationStatus {
  configured: boolean;
  source: 'CLOUDINARY_URL' | 'individual_variables' | null;
  invalidKeys: string[];
}

const PLACEHOLDER_PATTERN = /^(?:your_|replace_|example|xxx|change_me)|(?:_here)$/i;

const normalize = (value: string | undefined): string => value?.trim() ?? '';

const isUsableCredential = (value: string): boolean =>
  value.length > 0 && !PLACEHOLDER_PATTERN.test(value);

const parseCloudinaryUrl = (value: string): CloudinaryCredentials | null => {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'cloudinary:') return null;
    const credentials = {
      cloudName: decodeURIComponent(parsed.hostname),
      apiKey: decodeURIComponent(parsed.username),
      apiSecret: decodeURIComponent(parsed.password),
    };
    return Object.values(credentials).every(isUsableCredential) ? credentials : null;
  } catch {
    return null;
  }
};

const cloudinaryUrl = normalize(process.env.CLOUDINARY_URL);
const urlCredentials = parseCloudinaryUrl(cloudinaryUrl);
const individualCredentials: CloudinaryCredentials = {
  cloudName: normalize(process.env.CLOUDINARY_CLOUD_NAME),
  apiKey: normalize(process.env.CLOUDINARY_API_KEY),
  apiSecret: normalize(process.env.CLOUDINARY_API_SECRET),
};

const individualEntries = [
  ['CLOUDINARY_CLOUD_NAME', individualCredentials.cloudName],
  ['CLOUDINARY_API_KEY', individualCredentials.apiKey],
  ['CLOUDINARY_API_SECRET', individualCredentials.apiSecret],
] as const;
const invalidIndividualKeys = individualEntries
  .filter(([, value]) => !isUsableCredential(value))
  .map(([key]) => key);
const individualCredentialsAreValid = invalidIndividualKeys.length === 0;
const resolvedCredentials = urlCredentials
  ?? (individualCredentialsAreValid ? individualCredentials : null);

export const cloudinaryConfigurationStatus: CloudinaryConfigurationStatus = {
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

cloudinary.config({
  ...(resolvedCredentials && {
    cloud_name: resolvedCredentials.cloudName,
    api_key: resolvedCredentials.apiKey,
    api_secret: resolvedCredentials.apiSecret,
  }),
  secure: true,
});

export default cloudinary;
