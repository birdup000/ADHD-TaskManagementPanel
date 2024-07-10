import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text, ScrollView, Dimensions, Alert } from 'react-native';
import { ExternalLink } from './ExternalLink';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AGIXT_API_URI_KEY = "agixtapi";
const AGIXT_API_KEY_KEY = "agixtkey";
const AUTH_KEY_KEY = "authKey";
const GITHUB_USERNAME_KEY = "githubUsername";

export default function EditScreenInfo({ path }) {
  const [agixtApiUri, setAgixtApiUri] = useState('');
  const [agixtApiKey, setAgixtApiKey] = useState('');
  const [authKey, setAuthKey] = useState('');
  const [githubUsername, setGithubUsername] = useState('');

  useEffect(() => {
    const getSettings = async () => {
      try {
        const storedApiUri = await AsyncStorage.getItem(AGIXT_API_URI_KEY);
        const storedApiKey = await AsyncStorage.getItem(AGIXT_API_KEY_KEY);
        const storedAuthKey = await AsyncStorage.getItem(AUTH_KEY_KEY);
        const storedGithubUsername = await AsyncStorage.getItem(GITHUB_USERNAME_KEY);
        if (storedApiUri) setAgixtApiUri(storedApiUri);
        if (storedApiKey) setAgixtApiKey(storedApiKey);
        if (storedAuthKey) setAuthKey(storedAuthKey);
        if (storedGithubUsername) setGithubUsername(storedGithubUsername);
      } catch (e) {
        console.error('Error accessing AsyncStorage:', e);
      }
    };
    getSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      await AsyncStorage.setItem(AGIXT_API_URI_KEY, agixtApiUri);
      await AsyncStorage.setItem(AGIXT_API_KEY_KEY, agixtApiKey);
      await AsyncStorage.setItem(AUTH_KEY_KEY, authKey);
      await AsyncStorage.setItem(GITHUB_USERNAME_KEY, githubUsername);
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (e) {
      console.error('Error saving settings to AsyncStorage:', e);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

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
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const InputField = ({ icon, placeholder, value, onChangeText, secureTextEntry, multiline }) => (
  <View style={[styles.inputContainer, multiline && styles.multilineContainer]}>
    <FontAwesome5 name={icon} size={20} color="#FFFFFF80" style={styles.inputIcon} />
    <TextInput
      style={[styles.input, multiline && styles.multilineInput]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="#FFFFFF80"
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
      pointerEvents="auto"
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