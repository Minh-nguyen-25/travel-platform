"use strict";
// Tận dụng string literal thay vì redefine enum để nhất quán với Prisma schema
// Prisma sẽ tự validate giá trị này khi insert/update
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP_STATUS = exports.BUDGET_LEVEL = exports.TRAVEL_MODE = exports.AUTH_PROVIDER = exports.ROLE = void 0;
exports.ROLE = {
    USER: 'USER',
    ADMIN: 'ADMIN',
};
exports.AUTH_PROVIDER = {
    LOCAL: 'LOCAL',
    GOOGLE: 'GOOGLE',
};
exports.TRAVEL_MODE = {
    WALKING: 'WALKING',
    DRIVING: 'DRIVING',
    TRANSIT: 'TRANSIT',
    CYCLING: 'CYCLING',
};
exports.BUDGET_LEVEL = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
};
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    UNPROCESSABLE: 422,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    INTERNAL_SERVER_ERROR: 500,
};
//# sourceMappingURL=index.js.map