"use client";
// pages/register.js
import { useState, useContext } from 'react';
import { AuthContext } from '../../components/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { BackendConfigProvider, useBackendConfig } from '../../components/BackendConfig';
import BackendConfigModal from '../../components/BackendConfigModal';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { apiBaseUrl } = useBackendConfig() || {};


  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiBaseUrl || 'http://localhost:7437'}/v1/user`, {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      if (response.status === 200) {
          setMessage('Registration successful. Please log in.');
          setError('');
          router.push('/login');
      } else {
        setError(response.data.error || 'Registration failed.');
        setMessage('');
      }
    } catch (err) {
      setError('Registration failed.');
      setMessage('');
    }
  };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };


  return (
    <BackendConfigProvider>
    <div className="flex items-center justify-center h-screen">
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-bold mb-4">Signup</h2>
        {message && <p>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-300 p-2 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-gray-300 p-2 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">First Name:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="border border-gray-300 p-2 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Last Name:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="border border-gray-300 p-2 rounded-md w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Signup
        </button>
        <p className="mt-4 text-center">
          Already have an account?{' '}
          <a href="/login" className="text-blue-500">
            Log in
          </a>
        </p>
          <button
            type="button"
            className="mt-4 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            onClick={openModal}
          >
            Edit Backend Config
          </button>
          <BackendConfigModal isOpen={isModalOpen} onClose={closeModal} />
      </form>
    </div>
    </BackendConfigProvider>
  );
}