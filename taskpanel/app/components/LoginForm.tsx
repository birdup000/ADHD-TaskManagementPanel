"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [backendUrl, setBackendUrl] = useState('http://localhost:12437'); // Default backend URL
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch(`${backendUrl}/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token: otp }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.detail.startsWith('http')) {
          const url = new URL(data.detail);
          const token = url.searchParams.get('token');
          if (token) {
            localStorage.setItem('authToken', token);
            router.refresh();
            window.location.reload();
          } else {
             setMessage('Login failed: Token not found in the magic link.');
          }
        } else {
          setMessage(data.detail);
        }
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || 'Login failed');
      }
    } catch (error) {
      setMessage('An error occurred during login.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#212121] rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-8">Sign In</h2>
        <div className="space-y-4">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Backend URL
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-[#333333] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter backend URL"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 bg-[#333333] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                OTP Token
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-[#333333] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your OTP token"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleLogin}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </button>
          </form>
          {message && <p className="text-white mt-4">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
