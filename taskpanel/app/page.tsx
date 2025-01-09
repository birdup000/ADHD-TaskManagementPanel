"use client";
import { useEffect, useState } from "react";
import TaskPanel from "../components/TaskPanel";
import { loadPuter, getPuter } from "../lib/puter";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const authenticate = async () => {
      try {
        await loadPuter();
        const puter = getPuter();
        const isAuthenticated = puter.auth ? puter.auth.isSignedIn() : false;
        if (isMounted) {
          setIsAuthenticated(isAuthenticated);
        }
      } catch (error) {
        if (isMounted) {
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
  }, []);

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
        <div className="max-w-4xl mx-auto">
          <div className="space-y-2 mb-10">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Authentication Required
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Please authenticate to access your task panel
            </p>
            <button
              onClick={async () => {
                try {
                  setIsLoading(true);
                  const puter = getPuter();
                  if (!puter.auth) {
                    throw new Error('Puter auth not available');
                  }
                  await puter.auth.authenticate();
                  const authResult = puter.auth.isSignedIn();
                  setIsAuthenticated(authResult);
                } catch (error) {
                  console.error('Authentication failed:', error);
                  setIsAuthenticated(false);
                } finally {
                  setIsLoading(false);
                }
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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
      <div>
        <div className="space-y-2 mb-10">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Welcome to Your Task Panel
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Let's make today productive and stress-free
          </p>
        </div>
        <TaskPanel />
      </div>
    </div>
  );
}
