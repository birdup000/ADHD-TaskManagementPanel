import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Button } from 'react-native';
import { ExternalLink } from './ExternalLink';
import { MonoText } from './StyledText';
import { Text, View } from './Themed';
import Colors from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditScreenInfo({ path }: { path: string }) {
  const [authKey, setAuthKey] = useState('');
  const [githubUsername, setGithubUsername] = useState('');

  useEffect(() => {
    const getSettings = async () => {
      try {
        const storedAuthKey = await AsyncStorage.getItem('authKey');
        const storedGithubUsername = await AsyncStorage.getItem('githubUsername');
        if (storedAuthKey) {
          setAuthKey(storedAuthKey);
        }
        if (storedGithubUsername) {
          setGithubUsername(storedGithubUsername);
        }
      } catch (e) {
        console.error('Error accessing AsyncStorage:', e);
      }
    };
    getSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      await AsyncStorage.setItem('authKey', authKey);
      await AsyncStorage.setItem('githubUsername', githubUsername);
    } catch (e) {
      console.error('Error saving settings to AsyncStorage:', e);
    }
  };

  return (
    <View>
      <View style={styles.getStartedContainer}>
        <Text
          style={styles.getStartedText}
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)"
        >
          Help Details Here
        </Text>
        <Text
          style={styles.getStartedText}
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)"
        >
          Settings Details Here
        </Text>
        <TextInput
          style={styles.settingsInput}
          placeholder="Enter Github Personal Access Token"
          value={authKey}
          onChangeText={(text) => setAuthKey(text)}
        />
        <TextInput
          style={styles.settingsInput}
          placeholder="Enter GitHub username"
          value={githubUsername}
          onChangeText={(text) => setGithubUsername(text)}
        />
        <Button title="Save Settings" onPress={handleSaveSettings} />
      </View>
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
  );
}

const styles = StyleSheet.create({
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightContainer: {
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  helpContainer: {
    marginTop: 15,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    textAlign: 'center',
  },
  settingsInput: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 8,
    marginVertical: 8,
    color: 'white',
    paddingVertical: 15,
  },
});