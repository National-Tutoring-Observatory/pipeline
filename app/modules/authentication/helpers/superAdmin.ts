import type { User } from '~/modules/users/users.types';

export function isSuperAdmin(user: User | null): boolean {
    if (!user) {
        return false;
    }
    return user.role === 'SUPER_ADMIN';
}

export function validateSuperAdmin(user: User | null): void {
    if (!isSuperAdmin(user)) {
        throw new Error("You do not have permission to access this resource.");
    }
}
