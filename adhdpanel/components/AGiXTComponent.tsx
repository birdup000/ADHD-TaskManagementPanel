import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AGiXTSDK from "agixt";

const AGIXT_API_URI_KEY = "agixtapi";
const AGIXT_API_KEY_KEY = "agixtkey";

const AGiXTComponent = ({ agixtApiUri, agixtApiKey }) => {
  const [providers, setProviders] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const agixt = new AGiXTSDK({
          baseUri: agixtApiUri,
          apiKey: agixtApiKey,
        });

        const providers = await agixt.getProviders();
        setProviders(providers);
        setError(null);
      } catch (error) {
        console.error("Error fetching providers:", error);
        setError("Error fetching providers");
      }
    };

    fetchProviders();
  }, [agixtApiUri, agixtApiKey]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const { width, height } = Dimensions.get("window");

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.sidebar,
          isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed,
        ]}
      >
        <ScrollView>
          {providers.length > 0 && (
            <View style={styles.providersContainer}>
              <Text style={styles.providersLabel}>Available Providers:</Text>
              <View style={styles.providersList}>
                {providers.map((provider) => (
                  <View key={provider} style={styles.providerItem}>
                    <Text style={styles.providerText}>{provider}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>
      </View>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          {
            position: "absolute",
            top: 24,
            left: isSidebarOpen ? 24 : 12,
          },
        ]}
        onPress={toggleSidebar}
      >
        <Text style={styles.toggleButtonText}>{isSidebarOpen ? ">" : "<"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  sidebar: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "70%",
    backgroundColor: "#1E1E1E",
    padding: 24,
    borderLeftWidth: 1,
    borderLeftColor: "#FFFFFF20",
  },
  sidebarOpen: {
    transform: [{ translateX: 0 }],
  },
  sidebarClosed: {
    transform: [{ translateX: Dimensions.get("window").width }],
  },
  toggleButton: {
    backgroundColor: "#2E2E2E",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  toggleButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  providersContainer: {
    marginTop: 24,
  },
  providersLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  providersList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  providerItem: {
    backgroundColor: "#2E2E2E",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  providerText: {
    color: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AGiXTComponent;
