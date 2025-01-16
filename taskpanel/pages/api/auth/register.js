// pages/api/auth/register.js
import axios from 'axios';

export default async (req, res) => {
  if (req.method === 'POST') {
    const { email, password, first_name, last_name } = req.body;

    try {
      const response = await axios.post('http://localhost:7437/v1/user', {
        email,
        password,
        first_name,
        last_name,
        invitation_id: null, // If you have invitations, handle accordingly
      });
      res.status(200).json({ message: 'Registration successful.' });
    } catch (error) {
      res.status(error.response.status || 500).json({ error: error.response.data.error });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};