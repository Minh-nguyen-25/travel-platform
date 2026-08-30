import { AdminUserListQuery, AdminUserResponse, ChangePasswordInput, UserResponse } from '../types/user.types';
export declare const userService: {
    getProfile(userId: number): Promise<UserResponse>;
    updateProfile(userId: number, fullName: string): Promise<UserResponse>;
    changePassword(userId: number, input: ChangePasswordInput): Promise<import("../types").AuthSession>;
    uploadAvatar(userId: number, file?: Express.Multer.File): Promise<UserResponse>;
    deleteAvatar(userId: number): Promise<UserResponse>;
    getAdminUsers(query: AdminUserListQuery): Promise<{
        data: AdminUserResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getAdminUser(userId: number): Promise<AdminUserResponse>;
    setUserStatus(actorId: number, userId: number, isActive: boolean): Promise<AdminUserResponse>;
    setUserRole(actorId: number, userId: number, role: "ADMIN" | "USER"): Promise<AdminUserResponse>;
};
//# sourceMappingURL=user.service.d.ts.map