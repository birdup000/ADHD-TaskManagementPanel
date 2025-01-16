"use client";

import { useState, useContext } from "react";
import { AuthContext } from "../../components/AuthContext";
import { useRouter } from "next/navigation";
import { BackendConfigProvider, useBackendConfig } from "../../components/BackendConfig";
import BackendConfigModal from "../../components/BackendConfigModal";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { apiBaseUrl } = useBackendConfig() || {};


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    if (!apiBaseUrl) {
      setError("Please configure the AGiXT backend URL first.");
      return;
    }

    const { apiKey } = useBackendConfig() || {};
    try {
      const response = await axios.post(`${apiBaseUrl}/v1/login`, {
        email,
        password,
      }, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      
      const { token, user } = response.data;
      login(token);
      localStorage.setItem("user", JSON.stringify(user));
      router.push("/dashboard");
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message.includes("Network Error")) {
        setError("Unable to connect to AGiXT backend. Please check your backend configuration.");
      } else if (error.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
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
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-bold mb-4">Login</h2>
         {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-2 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-2 rounded-md w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Login
        </button>
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-500">
            Sign up
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