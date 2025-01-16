// components/Logout.js
import { useEffect } from 'react';
import axios from 'axios';

const Logout = () => {
  useEffect(() => {
    // Clear httpOnly cookie by sending a logout request
    axios.post('http://localhost:7437/api/auth/logout', null, {
      withCredentials: true,
    }).then(() => {
      // Clear localStorage if using localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    });
  }, []);

  return <div>Logging out...</div>;
};

export default Logout;