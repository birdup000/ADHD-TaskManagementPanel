export interface User {
    id: string;
    username: string;
    passwordHash: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface JWTPayload {
    userId: string;
    username: string;
    iat?: number;
    exp?: number;
}