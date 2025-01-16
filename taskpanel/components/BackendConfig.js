// components/BackendConfig.js
import { useState, createContext, useContext, useEffect } from 'react';

const BackendConfigContext = createContext();

export const BackendConfigProvider = ({ children }) => {
  const [apiBaseUrl, setApiBaseUrl] = useState(process.env.NEXT_PUBLIC_AGIXT_API_BASE_URL || 'http://localhost:7437');
  const [apiKey, setApiKey] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [configError, setConfigError] = useState('');

  useEffect(() => {
    const storedApiBaseUrl = localStorage.getItem('apiBaseUrl');
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiBaseUrl) {
      setApiBaseUrl(storedApiBaseUrl);
    }
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);


  const updateApiBaseUrl = async (newUrl) => {
    try {
      // Basic URL validation
      new URL(newUrl);
      setApiBaseUrl(newUrl);
      localStorage.setItem('apiBaseUrl', newUrl);
    } catch (error) {
      console.error('URL update error:', error);
      setConfigError('Invalid URL format');
      throw error;
    }
  };

  const updateApiKey = async (newKey) => {
    if (newKey.trim() === '') {
      setConfigError('API Key cannot be empty');
      return false;
    }

        setApiKey(newKey);
        localStorage.setItem('apiKey', newKey);
        return true;
      };
  return (
    <BackendConfigContext.Provider 
      value={{ 
        apiBaseUrl, 
        updateApiBaseUrl, 
        apiKey, 
        updateApiKey,
        isValidUrl,
        configError 
      }}
    >
      {children}
    </BackendConfigContext.Provider>
  );
};

export const useBackendConfig = () => {
  return useContext(BackendConfigContext);
};