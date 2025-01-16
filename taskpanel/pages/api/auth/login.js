// pages/api/auth/login.js
import { loginUser } from "../../../agixt/lib/auth-service";
import { setCookie } from "cookies-next";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    try {
      const authResponse = await loginUser(username, password);
      if (!authResponse) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
      const token = authResponse.token;
      // Set JWT token as a secure, HTTP-only cookie
      setCookie("token", token, {
        req,
        res,
        maxAge: 60 * 60 * 24, // 1 day
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
      return res.status(200).json({ message: "Login successful.", user: authResponse.user });
    } catch (error) {
      return res.status(500).json({ message: "Error logging in.", error: error.message });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed." });
  }
}