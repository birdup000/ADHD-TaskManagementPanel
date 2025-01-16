// pages/api/auth/user.js
import { verifyToken } from "../../../agixt/lib/auth-service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }

    try {
      const payload = verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token." });
      }
      // Here, you might want to fetch additional user details from the database if necessary
      return res.status(200).json({ message: "User authenticated.", user: payload });
    } catch (error) {
      return res.status(500).json({ message: "Error verifying token.", error: error.message });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed." });
  }
}