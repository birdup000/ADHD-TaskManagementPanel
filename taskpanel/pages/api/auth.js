// pages/api/auth.js
import axios from 'axios';
import { AGIXT_API_BASE_URL } from '../../lib/agixConfig';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

     if (req.url === '/api/auth/login') {
      try {
        // Call AGiXT's login endpoint
        const response = await axios.post(`${AGIXT_API_BASE_URL}/v1/login`, {
          email,
          password,
        });
        const { token, user } = response.data;
        res.status(200).json({ token, user });
      } catch (error) {
        res.status(400).json({ error: error.response.data.error });
      }
    } else {
      res.status(404).json({ error: 'Endpoint not found.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}