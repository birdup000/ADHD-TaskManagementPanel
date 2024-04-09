import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function TabOneScreen() {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          {
            opacity: fadeIn ? 1 : 0,
            transform: [{ translateY: fadeIn ? 0 : -50 }],
            transition: "opacity 0.5s, transform 0.5s",
            transitionDelay: "0.2s",
            color: 'white',
          },
        ]}
      >
        Welcome to the ADHD Panel
      </Text>
      <Text
        style={[
          styles.text,
          {
            opacity: fadeIn ? 1 : 0,
            transform: [{ translateY: fadeIn ? 0 : 50 }],
            transition: "opacity 0.5s, transform 0.5s",
            transitionDelay: "0.4s",
            color: 'white',
          },
        ]}
      >
        We're here to help you manage your ADHD and improve your daily life.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 42,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
  },
});
