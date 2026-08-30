import { Prisma, User } from '@prisma/client';
import { AdminUserListQuery } from '../types/user.types';
declare const adminUserInclude: {
    _count: {
        select: {
            reviews: true;
            favorites: true;
            trips: true;
        };
    };
};
export type AdminUserRecord = Prisma.UserGetPayload<{
    include: typeof adminUserInclude;
}>;
export declare const userRepository: {
    findById(id: number): Promise<User | null>;
    updateProfile(id: number, fullName: string): Promise<User>;
    updatePassword(id: number, passwordHash: string): Promise<User>;
    updateAvatar(id: number, avatarUrl: string | null): Promise<User>;
    findManyAdmin(query: AdminUserListQuery): Promise<{
        data: AdminUserRecord[];
        total: number;
    }>;
    findAdminById(id: number): Promise<AdminUserRecord | null>;
    setStatus(id: number, isActive: boolean): Promise<AdminUserRecord>;
    setRole(id: number, role: "ADMIN" | "USER"): Promise<AdminUserRecord>;
};
export {};
//# sourceMappingURL=user.repository.d.ts.map