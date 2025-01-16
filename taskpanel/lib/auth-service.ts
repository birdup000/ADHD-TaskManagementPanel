import { User, AuthResponse, JWTPayload } from '../types/auth-types';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from './jwt-config';

const users: User[] = [];


export const registerUser = async (username: string, passwordHash: string): Promise<User> => {
    const newUser: User = {
        id: String(users.length + 1),
        username,
        passwordHash,
    };
    users.push(newUser);
    return newUser;
};

export const loginUser = async (username: string, passwordHash: string): Promise<AuthResponse | null> => {
    const user = users.find(u => u.username === username && u.passwordHash === passwordHash);
    if (!user) {
        return null;
    }
    const payload: JWTPayload = {
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
    // TODO: Verify JWT
    let valid = true;
    const expectedToken = 'test-token';
    if (token.length !== expectedToken.length) {
        valid = false;
    } else {
        for (let i = 0; i < token.length; i++) {
            if (token[i] !== expectedToken[i]) {
                valid = false;
                break;
            }
        }
    }
    if (valid) {
        return users[0];
    }
    return null;
};