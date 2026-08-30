import { Request, Response } from 'express';
export declare const REFRESH_COOKIE_NAME: string;
export declare const GOOGLE_OAUTH_STATE_COOKIE_NAME = "travel_google_oauth_state";
export declare const getRefreshTokenFromRequest: (req: Request) => string | null;
export declare const getGoogleOAuthStateFromRequest: (req: Request) => string | null;
export declare const setRefreshTokenCookie: (res: Response, token: string, expiresAt: Date) => void;
export declare const clearRefreshTokenCookie: (res: Response) => void;
export declare const setGoogleOAuthStateCookie: (res: Response, state: string) => void;
export declare const clearGoogleOAuthStateCookie: (res: Response) => void;
//# sourceMappingURL=auth-cookie.utils.d.ts.map