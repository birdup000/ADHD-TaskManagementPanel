import React from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import TaskPanel from "@/components/tasklist";

const client = new ApolloClient({
  uri: "https://api.github.com/graphql",
  cache: new InMemoryCache(),
  headers: {
    Authorization: "Bearer your-github-personal-access-token-here",
  },
});

export default function App() {
  return (
    <ApolloProvider client={client}>
      <TaskPanel />
    </ApolloProvider>
  );
}
