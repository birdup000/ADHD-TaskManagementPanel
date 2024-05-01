import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Button, View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { ExternalLink } from './ExternalLink';
import { MonoText } from './StyledText';
import Colors from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';

const AGIXT_API_URI_KEY = "agixtapi";
const AGIXT_API_KEY_KEY = "agixtkey";
const AUTH_KEY_KEY = "authKey";
const GITHUB_USERNAME_KEY = "githubUsername";
const IS_LOCKED_KEY = "isLocked";

export default function EditScreenInfo({ path }: { path: string }) {
  const [agixtApiUri, setAgixtApiUri] = useState('');
  const [agixtApiKey, setAgixtApiKey] = useState('');
  const [authKey, setAuthKey] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    const getSettings = async () => {
      try {
        const storedApiUri = await AsyncStorage.getItem(AGIXT_API_URI_KEY);
        const storedApiKey = await AsyncStorage.getItem(AGIXT_API_KEY_KEY);
        const storedAuthKey = await AsyncStorage.getItem(AUTH_KEY_KEY);
        const storedGithubUsername = await AsyncStorage.getItem(GITHUB_USERNAME_KEY);
        const storedIsLocked = await AsyncStorage.getItem(IS_LOCKED_KEY);
        if (storedApiUri) {
          setAgixtApiUri(storedApiUri);
        }
        if (storedApiKey) {
          setAgixtApiKey(storedApiKey);
        }
        if (storedAuthKey) {
          setAuthKey(storedAuthKey);
        }
        if (storedGithubUsername) {
          setGithubUsername(storedGithubUsername);
        }
        if (storedIsLocked) {
          setIsLocked(JSON.parse(storedIsLocked));
        }
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
      await AsyncStorage.setItem(IS_LOCKED_KEY, JSON.stringify(isLocked));
    } catch (e) {
      console.error('Error saving settings to AsyncStorage:', e);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help</Text>
          <View style={styles.helpContainer}>
            <ExternalLink
              style={styles.helpLink}
              href="https://github.com/birdup000/ADHD-TaskManagementPanel"
            >
              <Text style={styles.helpLinkText} lightColor={Colors.light.tint}>
                Tap here for documentation
              </Text>
            </ExternalLink>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsContainer}>
            <TextInput
              style={[styles.settingsInput, styles.inputField]}
              placeholder="Enter AGiXT API URI"
              value={agixtApiUri}
              onChangeText={(text) => setAgixtApiUri(text)}
              placeholderTextColor="#FFFFFF80"
            />
            <TextInput
              style={[styles.settingsInput, styles.inputField]}
              placeholder="Enter AGiXT API Key"
              value={agixtApiKey}
              onChangeText={(text) => setAgixtApiKey(text)}
              placeholderTextColor="#FFFFFF80"
              secureTextEntry
            />
            <TextInput
              style={[styles.settingsInput, styles.inputField]}
              placeholder="Enter GitHub Personal Access Token"
              value={authKey}
              onChangeText={(text) => setAuthKey(text)}
              placeholderTextColor="#FFFFFF80"
              secureTextEntry
            />
            <TextInput
              style={[styles.settingsInput, styles.inputField]}
              placeholder="Enter GitHub username"
              value={githubUsername}
              onChangeText={(text) => setGithubUsername(text)}
              placeholderTextColor="#FFFFFF80"
            />
            <View style={styles.lockContainer}>
              <Text style={styles.lockText}>Lock/Unlock Task Map</Text>
              <TouchableOpacity
                style={[
                  styles.lockButton,
                  { backgroundColor: isLocked ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.8)' },
                ]}
                onPress={() => setIsLocked(!isLocked)}
              >
                <FontAwesome5
                  name={isLocked ? 'lock' : 'unlock'}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </View>
            <Button title="Save Settings" onPress={handleSaveSettings} color="#007AFF" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  contentContainer: {
    paddingHorizontal: Dimensions.get('window').width * 0.1,
    paddingVertical: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  helpContainer: {
    marginBottom: 24,
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    textAlign: 'center',
    color: '#FFFFFF',
  },
  settingsContainer: {
    marginBottom: 24,
  },
  settingsInput: {
    borderWidth: 1,
    borderColor: '#FFFFFF80',
    padding: 12,
    marginVertical: 8,
    color: '#FFFFFF',
    borderRadius: 8,
  },
  inputField: {
    backgroundColor: '#2E2E2E',
  },
  lockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  lockText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  lockButton: {
    padding: 12,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});