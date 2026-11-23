import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../src/theme';

export default function OrganizerHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Organizer</Text>
      <Text style={styles.sub}>Shell only. Tools arrive in 22.3.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  title: { color: colors.text, fontSize: 24, fontWeight: '700' },
  sub: { color: colors.muted, marginTop: spacing.sm },
});
