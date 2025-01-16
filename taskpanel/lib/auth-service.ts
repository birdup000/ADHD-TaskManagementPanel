import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from './jwt-config';
import { User } from '../types/auth-types';

const users: User[] = []; // In production, use a database

export const registerUser = async (username: string, passwordHash: string): Promise<User> => {
    const newUser: User = {
        id: String(users.length + 1),
        username,
        passwordHash,
    };
    users.push(newUser);
    return newUser;
};

export const loginUser = async (username: string, passwordHash: string): Promise<{ token: string, user: User } | null> => {
    const user = users.find(u => u.username === username && u.passwordHash === passwordHash);
    if (!user) {
        return null;
    }
    const payload: { userId: string, username: string } = {
        userId: user.id,
        username: user.username
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    return {
        token,
        user
    };
};

export const verifyToken = async (token: string): Promise<User | null> => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, username: string };
        const user = users.find(u => u.id === decoded.userId);
        return user || null;
    } catch {
        return null;
    }
};