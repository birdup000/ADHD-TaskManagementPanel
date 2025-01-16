// components/BackendConfig.js
import { useState, createContext, useContext, useEffect } from 'react';

const BackendConfigContext = createContext();

export const BackendConfigProvider = ({ children }) => {
  const [apiBaseUrl, setApiBaseUrl] = useState('http://localhost:7437');
  const [apiKey, setApiKey] = useState('');

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


  const updateApiBaseUrl = (newUrl) => {
    setApiBaseUrl(newUrl);
      localStorage.setItem('apiBaseUrl', newUrl);
  };

    const updateApiKey = (newKey) => {
        setApiKey(newKey);
        localStorage.setItem('apiKey', newKey);
    };

  return (
    <BackendConfigContext.Provider value={{ apiBaseUrl, updateApiBaseUrl, apiKey, updateApiKey }}>
      {children}
    </BackendConfigContext.Provider>
  );
};

export const useBackendConfig = () => {
  return useContext(BackendConfigContext);
};