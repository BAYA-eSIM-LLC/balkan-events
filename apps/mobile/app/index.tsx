import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing } from '../src/theme';

export default function Welcome() {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>BALKAN EVENTS</Text>
      <Text style={styles.sub}>Regional ticketing for the Balkans</Text>
      <Pressable style={styles.primary} onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.primaryText}>Sign in</Text>
      </Pressable>
      <Pressable style={styles.secondary} onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.secondaryText}>Create account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: spacing.lg },
  brand: { color: colors.text, fontSize: 32, fontWeight: '700', marginBottom: spacing.sm },
  sub: { color: colors.muted, marginBottom: spacing.xl },
  primary: { backgroundColor: colors.accent, padding: spacing.md, borderRadius: 12, alignItems: 'center', marginBottom: spacing.sm },
  primaryText: { color: '#fff', fontWeight: '600' },
  secondary: { borderColor: colors.border, borderWidth: 1, padding: spacing.md, borderRadius: 12, alignItems: 'center' },
  secondaryText: { color: colors.text },
});
