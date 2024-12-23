export type UserRole = 'user' | 'admin';

export interface User {
    _id?: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt?: Date;
    lastLogin?: Date;
    orders?: string[]; // IDs des commandes
}
