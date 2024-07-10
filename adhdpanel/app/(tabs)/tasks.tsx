import React from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import TaskPanel from "@/components/tasklist";
import AsyncStorage from '@react-native-async-storage/async-storage';

async function getAuthKey() {
  try {
    const authKey = await AsyncStorage.getItem('authKey');
    return authKey;
  } catch (e) {
    console.error('Error getting auth key from AsyncStorage:', e);
    return null;
  }
}

async function setAuthKey(authKey) {
  try {
    await AsyncStorage.setItem('authKey', authKey);
  } catch (e) {
    console.error('Error saving auth key to AsyncStorage:', e);
  }
}

export default function App() {
  const [client, setClient] = React.useState(null);

  React.useEffect(() => {
    const createApolloClient = async () => {
      const authKey = await getAuthKey();
      const client = new ApolloClient({
        uri: "https://api.github.com/graphql",
        cache: new InMemoryCache(),
        headers: {
          Authorization: `Bearer ${authKey}`,
        },
      });
      setClient(client);
    };
    createApolloClient();
  }, []);

  if (!client) {
    return null; // or a loading indicator
  }

  return (
    <ApolloProvider client={client}>
      <TaskPanel />
    </ApolloProvider>
  );
}