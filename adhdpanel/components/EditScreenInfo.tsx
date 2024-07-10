import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text, ScrollView, Dimensions, Alert } from 'react-native';
import { ExternalLink } from './ExternalLink';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';

const STORAGE_KEYS = {
  AGIXT_API_URI: "agixtapi",
  AGIXT_API_KEY: "agixtkey",
  AUTH_KEY: "authKey",
  GITHUB_USERNAME: "githubUsername"
};

export default function EditScreenInfo({ path }: { path: string }) {
  const [settings, setSettings] = useState({
    agixtApiUri: '',
    agixtApiKey: '',
    authKey: '',
    githubUsername: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await Promise.all(
        Object.entries(STORAGE_KEYS).map(async ([key, storageKey]) => {
          const value = await AsyncStorage.getItem(storageKey);
          return [key.toLowerCase(), value || ''];
        })
      );
      setSettings(Object.fromEntries(loadedSettings));
    } catch (e) {
      console.error('Error loading settings:', e);
      Alert.alert('Error', 'Failed to load settings. Please try again.');
    }
  };

  const handleSaveSettings = async () => {
    try {
      await Promise.all(
        Object.entries(STORAGE_KEYS).map(([key, storageKey]) =>
          AsyncStorage.setItem(storageKey, settings[key.toLowerCase()])
        )
      );
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (e) {
      console.error('Error saving settings:', e);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prevSettings => ({ ...prevSettings, [key]: value }));
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help</Text>
          <ExternalLink
            style={styles.helpLink}
            href="https://github.com/birdup000/ADHD-TaskManagementPanel"
          >
            <Text style={styles.helpLinkText}>
              Tap here for documentation
            </Text>
          </ExternalLink>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsContainer}>
            <InputField
              icon="link"
              placeholder="AGiXT API URI"
              value={settings.agixtApiUri}
              onChangeText={(text) => updateSetting('agixtApiUri', text)}
            />
            <InputField
              icon="key"
              placeholder="AGiXT API Key"
              value={settings.agixtApiKey}
              onChangeText={(text) => updateSetting('agixtApiKey', text)}
              secureTextEntry
            />
            <InputField
              icon="github"
              placeholder="GitHub Personal Access Token"
              value={settings.authKey}
              onChangeText={(text) => updateSetting('authKey', text)}
              secureTextEntry
              multiline
            />
            <InputField
              icon="user"
              placeholder="GitHub Username"
              value={settings.githubUsername}
              onChangeText={(text) => updateSetting('githubUsername', text)}
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
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
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