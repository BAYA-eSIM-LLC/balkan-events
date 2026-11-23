import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { api } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function Scanners() {
  const [eventId, setEventId] = useState('');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const d = await api<any>(`/scanner/attendance?event_id=${eventId}`);
      setData(d);
    } catch (e: any) {
      setError(e.detail || 'Failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scanners</Text>
      <Text style={styles.note}>Camera scanning arrives in 22.4.</Text>
      <TextInput style={styles.input} placeholder="Event ID" placeholderTextColor={colors.muted} value={eventId} onChangeText={setEventId} />
      <Pressable style={styles.button} onPress={load}><Text style={styles.buttonText}>Load attendance</Text></Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {data && (
        <View>
          <Text style={styles.row}>Scanned: {data.scanned}</Text>
          <Text style={styles.row}>Already used: {data.already_used}</Text>
          <Text style={styles.row}>Invalid: {data.invalid}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  title: { color: colors.text, fontSize: 22, fontWeight: '700' },
  note: { color: colors.muted, marginBottom: spacing.md, fontSize: 12 },
  input: { backgroundColor: colors.surface, color: colors.text, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  button: { backgroundColor: colors.accent, padding: spacing.md, borderRadius: 12, alignItems: 'center', marginBottom: spacing.md },
  buttonText: { color: '#fff', fontWeight: '600' },
  row: { color: colors.text, marginBottom: 6 },
  error: { color: colors.danger, marginBottom: spacing.sm },
});
