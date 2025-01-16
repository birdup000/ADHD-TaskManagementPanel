// pages/api/auth/register.js
import { registerUser } from "../../../agixt/lib/auth-service";
import { setCookie } from "cookies-next";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    try {
      const user = await registerUser(username, password);
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      // Set JWT token as a secure, HTTP-only cookie
      setCookie("token", token, {
        req,
        res,
        maxAge: 60 * 60 * 24, // 1 day
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
      return res.status(201).json({ message: "User registered successfully.", user });
    } catch (error) {
      return res.status(500).json({ message: "Error registering user.", error: error.message });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed." });
  }
}