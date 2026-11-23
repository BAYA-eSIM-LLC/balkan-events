import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../src/theme';
import { API_BASE } from '../../src/services/api';

export default function Settings() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.sub}>API: {API_BASE}</Text>
      <Text style={styles.sub}>Tokens stored in SecureStore. Not logged.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  title: { color: colors.text, fontSize: 24, fontWeight: '700' },
  sub: { color: colors.muted, marginTop: spacing.sm },
});
