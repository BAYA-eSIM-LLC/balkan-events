import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { authApi } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function Profile() {
  const logout = async () => {
    await authApi.logout();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.sub}>Same account as the web platform.</Text>
      <Pressable style={styles.button} onPress={() => router.push('/organizer')}>
        <Text style={styles.buttonText}>Organizer tools</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  title: { color: colors.text, fontSize: 24, fontWeight: '700' },
  sub: { color: colors.muted, marginVertical: spacing.md },
  button: { borderColor: colors.border, borderWidth: 1, padding: spacing.md, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: colors.text },
});
