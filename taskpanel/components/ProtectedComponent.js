import { useEffect, useState } from 'react';
import axios from 'axios';
import Login from '../app/login/page';

const ProtectedComponent = (WrappedComponent) => {
  return (props) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Verify token with AGiXT
        axios
          .post('http://localhost:7437/api/auth/verify', null, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then(() => {
            setIsAuthenticated(true);
            setLoading(false);
          })
          .catch(() => {
            setIsAuthenticated(false);
            setLoading(false);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          });
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    }, []);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return <Login />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default ProtectedComponent;