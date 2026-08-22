// Tận dụng string literal thay vì redefine enum để nhất quán với Prisma schema
// Prisma sẽ tự validate giá trị này khi insert/update

export const ROLE = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;
export type Role = (typeof ROLE)[keyof typeof ROLE];

export const AUTH_PROVIDER = {
  LOCAL: 'LOCAL',
  GOOGLE: 'GOOGLE',
} as const;
export type AuthProvider = (typeof AUTH_PROVIDER)[keyof typeof AUTH_PROVIDER];

export const TRAVEL_MODE = {
  WALKING: 'WALKING',
  DRIVING: 'DRIVING',
  TRANSIT: 'TRANSIT',
  CYCLING: 'CYCLING',
} as const;
export type TravelMode = (typeof TRAVEL_MODE)[keyof typeof TRAVEL_MODE];

export const BUDGET_LEVEL = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;
export type BudgetLevel = (typeof BUDGET_LEVEL)[keyof typeof BUDGET_LEVEL];

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;
