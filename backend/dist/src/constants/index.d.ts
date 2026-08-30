export declare const ROLE: {
    readonly USER: "USER";
    readonly ADMIN: "ADMIN";
};
export type Role = (typeof ROLE)[keyof typeof ROLE];
export declare const AUTH_PROVIDER: {
    readonly LOCAL: "LOCAL";
    readonly GOOGLE: "GOOGLE";
};
export type AuthProvider = (typeof AUTH_PROVIDER)[keyof typeof AUTH_PROVIDER];
export declare const TRAVEL_MODE: {
    readonly WALKING: "WALKING";
    readonly DRIVING: "DRIVING";
    readonly TRANSIT: "TRANSIT";
    readonly CYCLING: "CYCLING";
};
export type TravelMode = (typeof TRAVEL_MODE)[keyof typeof TRAVEL_MODE];
export declare const BUDGET_LEVEL: {
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly HIGH: "HIGH";
};
export type BudgetLevel = (typeof BUDGET_LEVEL)[keyof typeof BUDGET_LEVEL];
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly TOO_MANY_REQUESTS: 429;
    readonly UNPROCESSABLE: 422;
    readonly BAD_GATEWAY: 502;
    readonly SERVICE_UNAVAILABLE: 503;
    readonly INTERNAL_SERVER_ERROR: 500;
};
//# sourceMappingURL=index.d.ts.map