import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Settings = () => {
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await loadSettings();
      if (settings) {
        setApiUrl(settings.apiUrl);
      }
    };
    fetchSettings();
  }, []);

  // Save settings
  const saveSettings = async () => {
    const settings = { apiUrl };
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(settings));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Load settings
  const loadSettings = async () => {
    try {
      const settingsString = await AsyncStorage.getItem('settings');
      if (settingsString !== null) {
        return JSON.parse(settingsString);
      }
      return null;
    } catch (error) {
      console.error('Error loading settings:', error);
      return null;
    }
  };

  return (
    <View>
      <Text 
       style={{ fontSize: 20, marginBottom: 10, color: 'white'}}
       >API URL:</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, color: 'white'}}
        onChangeText={text => setApiUrl(text)}
        value={apiUrl}
      />
      <Button title="Save Settings" onPress={saveSettings} />
    </View>
  );
};

export default Settings;
