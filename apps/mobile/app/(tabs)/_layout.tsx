import { useEffect, useState } from 'react';
import { Tabs, router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { getAccess } from '../../src/services/tokenStore';
import { colors } from '../../src/theme';

export default function TabsLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getAccess().then(token => {
      if (!token) router.replace('/');
      else setReady(true);
    });
  }, []);

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}><ActivityIndicator color={colors.accent} /></View>;

  return (
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: colors.bg },
      headerTintColor: colors.text,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.muted,
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
      <Tabs.Screen name="tickets" options={{ title: 'Tickets' }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders' }} />
      <Tabs.Screen name="preferences" options={{ title: 'Prefs' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
