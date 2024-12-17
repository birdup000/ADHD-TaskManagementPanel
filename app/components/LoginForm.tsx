"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { initiateLogin, verifyMagicLink, initiateOAuthLogin } from '../utils/auth';
import Image from 'next/image';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [useWithoutAuth, setUseWithoutAuth] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for magic link token in URL
    const token = searchParams?.get('token');
    if (token) {
      handleMagicLinkVerification(token);
    }
  }, [searchParams]);

  const handleMagicLinkVerification = async (token: string) => {
    setLoading(true);
    const response = await verifyMagicLink(token);
    if (response.success && response.token) {
      localStorage.setItem('authToken', response.token);
      if (response.email) {
        localStorage.setItem('userEmail', response.email);
      }
      router.refresh();
      window.location.reload();
    } else {
      setMessage(response.message);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (useWithoutAuth) {
      localStorage.setItem('noAuth', 'true');
      router.refresh();
      window.location.reload();
      return;
    }

    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    const response = await initiateLogin(email);
    setMessage(response.message);
    setLoading(false);
  };

  const handleOAuthLogin = async (provider: string) => {
    setLoading(true);
    const response = await initiateOAuthLogin(provider);
    if (response.success && response.token) {
      localStorage.setItem('authToken', response.token);
      if (response.email) {
        localStorage.setItem('userEmail', response.email);
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
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 bg-[#333333] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {loading ? 'Please wait...' : useWithoutAuth ? 'Continue' : 'Send Magic Link'}
            </button>
          </form>

          {!useWithoutAuth && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#212121] text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleOAuthLogin('github')}
                  disabled={loading}
                  className="flex items-center justify-center px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="white">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub
                </button>
                <button
                  onClick={() => handleOAuthLogin('google')}
                  disabled={loading}
                  className="flex items-center justify-center px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
                    />
                    <path
                      fill="#34A853"
                      d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"
                    />
                    <path
                      fill="#4A90E2"
                      d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"
                    />
                  </svg>
                  Google
                </button>
              </div>
            </>
          )}

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
