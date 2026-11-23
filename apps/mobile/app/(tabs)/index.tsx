import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../src/theme';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.sub}>Customer shell. Discovery and tickets arrive in 22.2.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  title: { color: colors.text, fontSize: 24, fontWeight: '700' },
  sub: { color: colors.muted, marginTop: spacing.sm },
});
