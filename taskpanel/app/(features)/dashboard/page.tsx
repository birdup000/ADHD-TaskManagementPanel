"use client";
import { useEffect, useState } from "react";
import TaskPanel from "../../../components/TaskPanel";
import { loadPuter, getPuter } from "../../../lib/puter";

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  useEffect(() => {
    let isMounted = true;

    const authenticate = async () => {
      try {
        const puterInstance = await loadPuter();
        const isAuthenticated = puterInstance?.auth ? puterInstance.auth.isSignedIn() : false;
        if (isMounted) {
          setIsAuthenticated(isAuthenticated);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load Puter.js:', error);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    authenticate();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-2 mb-10">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Authenticating...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="animate-fade-in">
        <div className="max-w-4xl mx-auto pt-20">
          <div className="space-y-2 mb-10">
            <h1 className="text-4xl text-center font-bold text-neutral-900 dark:text-neutral-100 mb-8">
              Authentication Required
            </h1>
            <p className="text-center text-neutral-500 dark:text-neutral-400 mb-8">
              Please authenticate to access your task panel
            </p>
            <button
              onClick={async () => {
                try {
                  setIsLoading(true);
                  const puterInstance = await loadPuter();
                  if (!puterInstance?.auth) {
                    console.error('Puter auth not available');
                    alert('Puter authentication module is not available. Please try again later.');
                    setIsAuthenticated(false);
                    return;
                  }
                  await puterInstance.auth.authenticate();
                  const authResult = puterInstance.auth.isSignedIn();
                  setIsAuthenticated(authResult);
                } catch (error) {
                  console.error('Authentication failed:', error);
                  alert('Authentication failed. Please try again.');
                  setIsAuthenticated(false);
                } finally {
                  setIsLoading(false);
                }
              }}
              className="mt-12 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors block mx-auto"
            >
              Retry Authentication
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col items-center justify-center min-h-screen">
        <TaskPanel onLogout={handleLogout} />
      </div>
    </div>
  );
}