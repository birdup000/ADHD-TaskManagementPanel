import { StyleSheet } from 'react-native';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';

export default function TabOneScreen() {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        opacity: fadeIn ? 1 : 0,
        transition: "opacity 0.5s",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontSize: "3rem",
          marginBottom: "2rem",
          transform: `translateY(${fadeIn ? "0" : "-50px"})`,
          opacity: fadeIn ? 1 : 0,
          transition: "transform 0.5s, opacity 0.5s",
          transitionDelay: "0.2s",
          color:'white',
        }}
      >
        Welcome to the ADHD Panel
      </h2>
      <p
        style={{
          fontSize: "1.5rem",
          transform: `translateY(${fadeIn ? "0" : "50px"})`,
          opacity: fadeIn ? 1 : 0,
          transition: "transform 0.5s, opacity 0.5s",
          transitionDelay: "0.4s",
          color:'white',
        }}
      >
        We're here to help you manage your ADHD and improve your daily life.
      </p>
    </div>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
