import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AGiXTSDK from "agixt";

const AGIXT_API_URI_KEY = "agixtapi";
const AGIXT_API_KEY_KEY = "agixtkey";

const AGiXTComponent = () => {
  const [agixtApiUri, setAgixtApiUri] = useState("");
  const [agixtApiKey, setAgixtApiKey] = useState("");
  const [providers, setProviders] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedApiUri = await AsyncStorage.getItem(AGIXT_API_URI_KEY);
        const storedApiKey = await AsyncStorage.getItem(AGIXT_API_KEY_KEY);

        if (storedApiUri) {
          setAgixtApiUri(storedApiUri);
        }

        if (storedApiKey) {
          setAgixtApiKey(storedApiKey);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(AGIXT_API_URI_KEY, agixtApiUri);
      await AsyncStorage.setItem(AGIXT_API_KEY_KEY, agixtApiKey);
      console.log("Settings saved successfully");
      await fetchProviders();
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const fetchProviders = async () => {
    try {
      const agixt = new AGiXTSDK({
        baseUri: agixtApiUri,
        apiKey: agixtApiKey,
      });

      const providers = await agixt.getProviders();
      setProviders(providers);
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const { width, height } = Dimensions.get("window");

  return (
    <View style={styles.container}>
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
      <View
        style={[
          styles.sidebar,
          isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed,
        ]}
      >
        <ScrollView>
          <View style={styles.settingsContainer}>
            <Text style={styles.settingsLabel}>AGiXT API URI:</Text>
            <TextInput
              style={styles.settingsInput}
              value={agixtApiUri}
              onChangeText={setAgixtApiUri}
              placeholder="Enter AGiXT API URI"
              placeholderTextColor="#FFFFFF80"
            />
          </View>
          <View style={styles.settingsContainer}>
            <Text style={styles.settingsLabel}>AGiXT API Key:</Text>
            <TextInput
              style={styles.settingsInput}
              value={agixtApiKey}
              onChangeText={setAgixtApiKey}
              placeholder="Enter AGiXT API Key"
              placeholderTextColor="#FFFFFF80"
              secureTextEntry
            />
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          {providers.length > 0 && (
            <View style={styles.providersContainer}>
              <Text style={styles.providersLabel}>Available Providers:</Text>
              <View style={styles.providersList}>
                {providers.map((provider) => (
                  <Text key={provider} style={styles.providerItem}>
                    {provider}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
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
  settingsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  settingsLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginRight: 12,
  },
  settingsInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#FFFFFF80",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#FFFFFF",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  saveButtonText: {
    color: "#FFFFFF",
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
    color: "#FFFFFF",
  },
});

export default AGiXTComponent;
