// pages/api/auth/logout.js
import { destroyCookie } from "cookies-next";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req, res) {
  if (req.method === "POST") {
    destroyCookie(req, res, "token", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "Logout successful." });
  } else {
    res.status(405).json({ message: "Method not allowed." });
  }
}