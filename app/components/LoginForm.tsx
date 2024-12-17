"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../utils/auth';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [useWithoutAuth, setUseWithoutAuth] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (useWithoutAuth) {
      localStorage.setItem('noAuth', 'true');
      router.refresh();
      window.location.reload();
      return;
    }

    if (!username || !password) {
      setMessage('Please enter both username and password');
      return;
    }

    setLoading(true);
    const response = await login(username, password);
    if (response.success && response.token) {
      localStorage.setItem('authToken', response.token);
      if (response.username) {
        localStorage.setItem('username', response.username);
      }
      router.refresh();
      window.location.reload();
    } else {
      setMessage(response.message);
    }
    setLoading(false);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUseWithoutAuth(e.target.checked);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#212121] rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-8">Sign In</h2>
        <div className="space-y-4">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Username
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-[#333333] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading || useWithoutAuth}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 bg-[#333333] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || useWithoutAuth}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="useWithoutAuth"
                className="mr-2"
                checked={useWithoutAuth}
                onChange={handleCheckboxChange}
                disabled={loading}
              />
              <label htmlFor="useWithoutAuth" className="text-sm text-gray-200">
                Use without authentication
              </label>
            </div>
            <button
              type="submit"
              onClick={handleLogin}
              disabled={loading}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : useWithoutAuth ? 'Continue' : 'Sign In'}
            </button>
          </form>

          {message && (
            <p className={`text-sm mt-4 ${message.includes('error') || message.includes('failed') ? 'text-red-400' : 'text-green-400'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
