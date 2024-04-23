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
const ALWAYS_USE_AGENT_KEY = "alwaysUseAgent";

const AGiXTComponent = ({ agixtApiUri, agixtApiKey }) => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [alwaysUseAgent, setAlwaysUseAgent] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const agixt = new AGiXTSDK({
          baseUri: agixtApiUri,
          apiKey: agixtApiKey,
        });

        const agentsData = await agixt.getAgents();
        const agentsList = Object.values(agentsData);
        setAgents(agentsList);
        setSelectedAgent(agentsList[0]?.name || "");

        // Check if "alwaysUseAgent" is stored in AsyncStorage
        const storedAlwaysUseAgent = await AsyncStorage.getItem(ALWAYS_USE_AGENT_KEY);
        if (storedAlwaysUseAgent !== null) {
          setAlwaysUseAgent(JSON.parse(storedAlwaysUseAgent));
        }

        setError(null);
      } catch (error) {
        console.error("Error fetching agents:", error);
        setError("Error fetching agents");
      }
    };

    fetchAgents();
  }, [agixtApiUri, agixtApiKey]);

  const { width, height } = Dimensions.get("window");

  const handleAlwaysUseAgentChange = async (value) => {
    setAlwaysUseAgent(value);
    await AsyncStorage.setItem(ALWAYS_USE_AGENT_KEY, JSON.stringify(value));
  };

  const handleOk = () => {
    // Perform the task that requires the selected agent
    console.log("Selected agent:", selectedAgent);
    console.log("Always use agent:", alwaysUseAgent);
  };

  return (
    <View style={styles.container}>
      {agents.length > 0 && (
        <View style={styles.agentsContainer}>
          <Text style={styles.agentsLabel}>Select an Agent:</Text>
          <Picker
            selectedValue={selectedAgent}
            onValueChange={(value) => setSelectedAgent(value)}
            style={styles.agentPicker}
          >
            <Picker.Item label="Select an agent" value="" />
            {agents.map((agent) => (
              <Picker.Item key={agent.name} label={agent.name} value={agent.name} />
            ))}
          </Picker>
          <View style={styles.agentsList}>
            {agents.map((agent) => (
              <View
                key={agent.name}
                style={[
                  styles.agentItem,
                  agent.name === selectedAgent
                    ? [styles.selectedAgentItem, styles.selectedAgentText]
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.agentText,
                    agent.name === selectedAgent
                      ? styles.selectedAgentText
                      : null,
                  ]}
                >
                  {agent.name}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.alwaysUseAgentContainer}>
            <Text style={styles.alwaysUseAgentLabel}>Always use this agent:</Text>
            <TouchableOpacity
              style={[
                styles.alwaysUseAgentCheckbox,
                alwaysUseAgent ? styles.alwaysUseAgentChecked : null,
              ]}
              onPress={() => handleAlwaysUseAgentChange(!alwaysUseAgent)}
            >
              {alwaysUseAgent && <Text style={styles.alwaysUseAgentCheckboxText}>✓</Text>}
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.okButton} onPress={handleOk}>
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
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
  agentsContainer: {
    marginTop: 24,
  },
  agentsLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  agentPicker: {
    color: "black",
    marginBottom: 16,
  },
  agentsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    color: "black",
  },
  agentItem: {
    backgroundColor: "#2E2E2E",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedAgentItem: {
    backgroundColor: "#4E4E4E",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  selectedAgentText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  agentText: {
    color: "black",
  },
  alwaysUseAgentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  alwaysUseAgentLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginRight: 8,
  },
  alwaysUseAgentCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  alwaysUseAgentChecked: {
    backgroundColor: "#FFFFFF",
  },
  alwaysUseAgentCheckboxText: {
    color: "#1E1E1E",
    fontWeight: "bold",
  },
  okButton: {
    backgroundColor: "#4E4E4E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 24,
  },
  okButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
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