// pages/_app.js
import { AuthProvider } from "../components/AuthContext";
import "../app/globals.css";
import { BackendConfigProvider } from '../components/BackendConfig';

function MyApp({ Component, pageProps }) {
  return (
    <BackendConfigProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </BackendConfigProvider>
  );
}

export default MyApp;