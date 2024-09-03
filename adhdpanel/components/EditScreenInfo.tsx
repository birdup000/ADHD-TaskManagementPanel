import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text, ScrollView, Dimensions, Alert } from 'react-native';
import { ExternalLink } from './ExternalLink';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AGIXT_API_URI_KEY = "agixtapi";
const AGIXT_API_KEY_KEY = "agixtkey";
const AUTH_KEY_KEY = "authKey";
const GITHUB_USERNAME_KEY = "githubUsername";
const INTERACTIVE_URI_KEY = "interactive_uri"; // Added key for chat component

export default function EditScreenInfo({ path }) {
  const [agixtApiUri, setAgixtApiUri] = useState('');
  const [agixtApiKey, setAgixtApiKey] = useState('');
  const [authKey, setAuthKey] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [interactiveUri, setInteractiveUri] = useState(''); // Added state for interactive URI

  useEffect(() => {
    const getSettings = async () => {
      try {
        const storedApiUri = await AsyncStorage.getItem(AGIXT_API_URI_KEY);
        const storedApiKey = await AsyncStorage.getItem(AGIXT_API_KEY_KEY);
        const storedAuthKey = await AsyncStorage.getItem(AUTH_KEY_KEY);
        const storedGithubUsername = await AsyncStorage.getItem(GITHUB_USERNAME_KEY);
        const storedInteractiveUri = await AsyncStorage.getItem(INTERACTIVE_URI_KEY);
        if (storedApiUri) setAgixtApiUri(storedApiUri);
        if (storedApiKey) setAgixtApiKey(storedApiKey);
        if (storedAuthKey) setAuthKey(storedAuthKey);
        if (storedGithubUsername) setGithubUsername(storedGithubUsername);
        if (storedInteractiveUri) setInteractiveUri(storedInteractiveUri);
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
      await AsyncStorage.setItem(INTERACTIVE_URI_KEY, interactiveUri);
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (e) {
      console.error('Error saving settings to AsyncStorage:', e);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.settingsContainer}>
          <InputField
            icon="link"
            placeholder="AGiXT API URI"
            value={agixtApiUri}
            onChangeText={setAgixtApiUri}
          />
          <InputField
            icon="key"
            placeholder="AGiXT API Key"
            value={agixtApiKey}
            onChangeText={setAgixtApiKey}
            secureTextEntry
          />
          <InputField
            icon="github"
            placeholder="GitHub Personal Access Token"
            value={authKey}
            onChangeText={setAuthKey}
            secureTextEntry
          />
          <InputField
            icon="user"
            placeholder="GitHub Username"
            value={githubUsername}
            onChangeText={setGithubUsername}
          />
          <InputField
            icon="comment"
            placeholder="Interactive Chat URI"
            value={interactiveUri}
            onChangeText={setInteractiveUri}
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.helpContainer}>
          <ExternalLink style={styles.helpLink} href="https://github.com/birdup000/ADHD-TaskManagementPanel">
            <FontAwesome5 name="question-circle" size={20} color="#FFFFFF" style={styles.helpIcon} />
            <Text style={styles.helpLinkText}>Documentation</Text>
          </ExternalLink>
        </View>
      </ScrollView>
    </View>
  );
}

const InputField = ({ icon, placeholder, value, onChangeText, secureTextEntry }) => (
  <View style={styles.inputContainer}>
    <FontAwesome5 name={icon} size={20} color="#FFFFFF80" style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="#FFFFFF80"
      secureTextEntry={secureTextEntry}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  settingsContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpContainer: {
    alignItems: 'center',
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
    padding: 15,
    borderRadius: 10,
  },
  helpIcon: {
    marginRight: 10,
  },
  helpLinkText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});