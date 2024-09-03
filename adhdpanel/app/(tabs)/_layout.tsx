import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
<Tabs
  screenOptions={{
    tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
    // Disable the static render of the header on web
    // to prevent a hydration error in React Navigation v6.
    headerShown: useClientOnlyValue(false, true),
    headerRight: () => (
      <Link href="/settings" asChild>
        <Pressable>
          {({ pressed }) => (
            <FontAwesome
              name="gear"
              size={25}
              color={Colors[colorScheme ?? 'light'].text}
              style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
            />
          )}
        </Pressable>
      </Link>
    ),
  }}>
  <Tabs.Screen
    name="index"
    options={{
      title: 'Home',
      tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
    }}
  />
  <Tabs.Screen
    name="tasks"
    options={{
      title: 'Task List',
      tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
    }}
  />
  <Tabs.Screen
    name="taskmap"
    options={{
      title: 'Task Map',
      tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
    }}
  />
  <Tabs.Screen
    name="calendar"
    options={{
      title: 'Calendar',
      tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
    }}
  />
</Tabs>
  );
}
