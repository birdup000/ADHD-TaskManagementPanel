import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Picker,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AGiXTSDK from "agixt";

const AGIXT_API_URI_KEY = "agixtapi";
const AGIXT_API_KEY_KEY = "agixtkey";

const AGiXTComponent = ({ agixtApiUri, agixtApiKey }) => {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState("");
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
        setSelectedProvider(providers[0] || "");
        setError(null);
      } catch (error) {
        console.error("Error fetching providers:", error);
        setError("Error fetching providers");
      }
    };

    fetchProviders();
  }, [agixtApiUri, agixtApiKey]);

  const { width, height } = Dimensions.get("window");

  return (
    <View style={styles.container}>
      {providers.length > 0 && (
        <View style={styles.providersContainer}>
          <Text style={styles.providersLabel}>Select a Provider:</Text>
          <Picker
            selectedValue={selectedProvider}
            onValueChange={(value) => setSelectedProvider(value)}
            style={styles.providerPicker}
          >
            <Picker.Item label="Select a provider" value="" />
            {providers.map((provider) => (
              <Picker.Item key={provider} label={provider} value={provider} />
            ))}
          </Picker>
          <View style={styles.providersList}>
            {providers.map((provider) => (
              <View
                key={provider}
                style={[
                  styles.providerItem,
                  provider === selectedProvider
                    ? [styles.selectedProviderItem, styles.selectedProviderText]
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.providerText,
                    provider === selectedProvider
                      ? styles.selectedProviderText
                      : null,
                  ]}
                >
                  {provider}
                </Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    padding: 24,
  },
  providersContainer: {
    marginTop: 24,
  },
  providersLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  providerPicker: {
    color: "#FFFFFF",
    marginBottom: 16,
  },
  providersList: {
    flexDirection: "row",
    flexWrap: "wrap",
    color: "black",
  },
  providerItem: {
    backgroundColor: "#2E2E2E",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedProviderItem: {
    backgroundColor: "#4E4E4E",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  selectedProviderText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  providerText: {
    color: "black",
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
