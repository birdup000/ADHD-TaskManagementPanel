import React from 'react';

const LoginForm: React.FC = () => {
  const handleLogin = (provider: 'google' | 'github' | 'email') => {
    // Authentication placeholder
    console.log(`Logging in with ${provider}`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#212121] rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-8">Sign In</h2>
        <div className="space-y-4">
          <button
            onClick={() => handleLogin('google')}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span>🔒</span>
            Continue with Google
          </button>
          <button
            onClick={() => handleLogin('github')}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition-colors"
          >
            <span>🔒</span>
            Continue with GitHub
          </button>
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#212121] px-4 text-sm text-gray-400">Or</span>
            </div>
          </div>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 bg-[#333333] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email"
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
              />
            </div>
            <button
              onClick={() => handleLogin('email')}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;