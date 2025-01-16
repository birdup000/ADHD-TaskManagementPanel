import { sign, verify, JwtPayload } from "jsonwebtoken";

export const registerUser = async (username: string, password: string) => {
  // Replace this with your actual registration logic
  // This example assumes a simple in-memory user store
  const user = { id: 1, username, password };
  return user;
};

export const loginUser = async (username: string, password: string) => {
  // Replace this with your actual login logic
  // This example assumes a simple in-memory user store
  const user = { id: 1, username, password };
  if (user.password === password) {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const token = sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    return { user, token };
  }
  return null;
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const payload = verify(token, process.env.JWT_SECRET) as JwtPayload;
    return payload;
  } catch (error) {
    throw new Error("Invalid token.");
  }
};