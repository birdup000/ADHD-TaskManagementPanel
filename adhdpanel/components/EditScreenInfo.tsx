import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text, ScrollView, Dimensions, Alert, Switch } from 'react-native';
import { ExternalLink } from './ExternalLink';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { RemoteStorage } from 'remote-storage';

const AGIXT_API_URI_KEY = "agixtapi";
const AGIXT_API_KEY_KEY = "agixtkey";
const AUTH_KEY_KEY = "authKey";
const GITHUB_USERNAME_KEY = "githubUsername";
const REMOTE_STORAGE_ENABLED_KEY = "remoteStorageEnabled";
const REMOTE_STORAGE_USER_ID_KEY = "remoteStorageUserId";
const REMOTE_STORAGE_INSTANCE_ID_KEY = "remoteStorageInstanceId";
const REMOTE_STORAGE_SERVER_ADDRESS_KEY = "remoteStorageServerAddress";

const DEFAULT_SERVER_ADDRESS = 'https://api.remote.storage';

export default function EditScreenInfo({ path }) {
  const [agixtApiUri, setAgixtApiUri] = useState('');
  const [agixtApiKey, setAgixtApiKey] = useState('');
  const [authKey, setAuthKey] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [remoteStorageEnabled, setRemoteStorageEnabled] = useState(false);
  const [remoteStorageUserId, setRemoteStorageUserId] = useState('');
  const [remoteStorageInstanceId, setRemoteStorageInstanceId] = useState('');
  const [remoteStorageServerAddress, setRemoteStorageServerAddress] = useState(DEFAULT_SERVER_ADDRESS);
  const [remoteStorage, setRemoteStorage] = useState(null);

  useEffect(() => {
    const getSettings = async () => {
      try {
        const storedApiUri = await AsyncStorage.getItem(AGIXT_API_URI_KEY);
        const storedApiKey = await AsyncStorage.getItem(AGIXT_API_KEY_KEY);
        const storedAuthKey = await AsyncStorage.getItem(AUTH_KEY_KEY);
        const storedGithubUsername = await AsyncStorage.getItem(GITHUB_USERNAME_KEY);
        const storedRemoteStorageEnabled = await AsyncStorage.getItem(REMOTE_STORAGE_ENABLED_KEY);
        const storedRemoteStorageUserId = await AsyncStorage.getItem(REMOTE_STORAGE_USER_ID_KEY);
        const storedRemoteStorageInstanceId = await AsyncStorage.getItem(REMOTE_STORAGE_INSTANCE_ID_KEY);
        const storedRemoteStorageServerAddress = await AsyncStorage.getItem(REMOTE_STORAGE_SERVER_ADDRESS_KEY);

        if (storedApiUri) setAgixtApiUri(storedApiUri);
        if (storedApiKey) setAgixtApiKey(storedApiKey);
        if (storedAuthKey) setAuthKey(storedAuthKey);
        if (storedGithubUsername) setGithubUsername(storedGithubUsername);
        if (storedRemoteStorageEnabled) setRemoteStorageEnabled(JSON.parse(storedRemoteStorageEnabled));
        if (storedRemoteStorageUserId) setRemoteStorageUserId(storedRemoteStorageUserId);
        if (storedRemoteStorageInstanceId) setRemoteStorageInstanceId(storedRemoteStorageInstanceId);
        if (storedRemoteStorageServerAddress) setRemoteStorageServerAddress(storedRemoteStorageServerAddress);
        
        // Generate instanceId if not present
        if (!storedRemoteStorageInstanceId) {
          const newInstanceId = uuidv4();
          setRemoteStorageInstanceId(newInstanceId);
          await AsyncStorage.setItem(REMOTE_STORAGE_INSTANCE_ID_KEY, newInstanceId);
        }

        // Initialize RemoteStorage if enabled
        if (JSON.parse(storedRemoteStorageEnabled) && storedRemoteStorageUserId) {
          initializeRemoteStorage(storedRemoteStorageUserId, storedRemoteStorageInstanceId || newInstanceId, storedRemoteStorageServerAddress || DEFAULT_SERVER_ADDRESS);
        }
      } catch (e) {
        console.error('Error accessing AsyncStorage:', e);
      }
    };
    getSettings();
  }, []);

  const initializeRemoteStorage = (userId, instanceId, serverAddress) => {
    const rs = new RemoteStorage({
      serverAddress: serverAddress,
      userId: userId,
      instanceId: instanceId
    });
    setRemoteStorage(rs);
  };

  const handleSaveSettings = async () => {
    try {
      await AsyncStorage.setItem(AGIXT_API_URI_KEY, agixtApiUri);
      await AsyncStorage.setItem(AGIXT_API_KEY_KEY, agixtApiKey);
      await AsyncStorage.setItem(AUTH_KEY_KEY, authKey);
      await AsyncStorage.setItem(GITHUB_USERNAME_KEY, githubUsername);
      await AsyncStorage.setItem(REMOTE_STORAGE_ENABLED_KEY, JSON.stringify(remoteStorageEnabled));
      await AsyncStorage.setItem(REMOTE_STORAGE_USER_ID_KEY, remoteStorageUserId);
      await AsyncStorage.setItem(REMOTE_STORAGE_INSTANCE_ID_KEY, remoteStorageInstanceId);
      await AsyncStorage.setItem(REMOTE_STORAGE_SERVER_ADDRESS_KEY, remoteStorageServerAddress);

      if (remoteStorageEnabled && remoteStorageUserId) {
        initializeRemoteStorage(remoteStorageUserId, remoteStorageInstanceId, remoteStorageServerAddress);
      } else {
        setRemoteStorage(null);
      }

      Alert.alert('Success', 'Settings saved successfully!');
    } catch (e) {
      console.error('Error saving settings to AsyncStorage:', e);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const toggleRemoteStorage = () => setRemoteStorageEnabled(previousState => !previousState);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help</Text>
          <View style={styles.helpContainer}>
            <ExternalLink style={styles.helpLink} href="https://github.com/birdup000/ADHD-TaskManagementPanel">
              <Text style={styles.helpLinkText}>Tap here for documentation</Text>
            </ExternalLink>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsContainer}>
            <InputField
              icon="link"
              placeholder="Enter AGiXT API URI"
              value={agixtApiUri}
              onChangeText={(text) => setAgixtApiUri(text)}
            />
            <InputField
              icon="key"
              placeholder="Enter AGiXT API Key"
              value={agixtApiKey}
              onChangeText={(text) => setAgixtApiKey(text)}
              secureTextEntry
            />
            <InputField
              icon="github"
              placeholder="Enter GitHub Personal Access Token"
              value={authKey}
              onChangeText={(text) => setAuthKey(text)}
              secureTextEntry
            />
            <InputField
              icon="user"
              placeholder="Enter GitHub username"
              value={githubUsername}
              onChangeText={(text) => setGithubUsername(text)}
            />
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Remote Storage</Text>
          <View style={styles.remoteStorageContainer}>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Enable Remote Storage</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={remoteStorageEnabled ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleRemoteStorage}
                value={remoteStorageEnabled}
              />
            </View>
            {remoteStorageEnabled && (
              <>
                <InputField
                  icon="user"
                  placeholder="Enter User ID"
                  value={remoteStorageUserId}
                  onChangeText={(text) => setRemoteStorageUserId(text)}
                />
                <InputField
  icon="tag"
  placeholder="Instance ID"
  value={remoteStorageInstanceId}
  onChangeText={(text) => setRemoteStorageInstanceId(text)}
/>
                <InputField
                  icon="server"
                  placeholder="Server Address"
                  value={remoteStorageServerAddress}
                  onChangeText={(text) => setRemoteStorageServerAddress(text)}
                />
              </>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const InputField = ({ icon, placeholder, value, onChangeText, secureTextEntry, multiline, editable = true }) => (
  <View style={[styles.inputContainer, multiline && styles.multilineContainer]}>
    <FontAwesome5 name={icon} size={20} color="#FFFFFF80" style={styles.inputIcon} />
    <TextInput
      style={[styles.input, multiline && styles.multilineInput, !editable && styles.disabledInput]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="#FFFFFF80"
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
      pointerEvents="auto"
      editable={editable}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    paddingHorizontal: Dimensions.get('window').width * 0.05,
    paddingVertical: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  helpLink: {
    backgroundColor: '#2C2C2C',
    padding: 18,
    borderRadius: 12,
    role: 'link',
  },
  helpLinkText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 18,
  },
  settingsContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  multilineContainer: {
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  inputIcon: {
    marginRight: 16,
    marginTop: 4,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    verticalAlign: 'top',
  },
  multilineInput: {
    height: 80,
  },
  disabledInput: {
    opacity: 0.5,
  },
  remoteStorageContainer: {
    backgroundColor: '#2C2C2C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});