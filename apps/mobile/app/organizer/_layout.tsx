import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { getAccess } from '../../src/services/tokenStore';
import { colors } from '../../src/theme';

export default function OrganizerLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getAccess().then(token => {
      if (!token) router.replace('/');
      else setReady(true);
    });
  }, []);

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}><ActivityIndicator color={colors.accent} /></View>;

  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text }}>
      <Stack.Screen name="index" options={{ title: 'Organizer' }} />
    </Stack>
  );
}
