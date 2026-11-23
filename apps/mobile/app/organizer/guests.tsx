import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, FlatList } from 'react-native';
import { api } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function Guests() {
  const [eventId, setEventId] = useState('');
  const [lists, setLists] = useState<any[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const d = await api<any[]>(`/guest-lists/event/${eventId}`);
      setLists(d);
    } catch (e: any) {
      setError(e.detail || 'Failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Guest lists</Text>
      <TextInput style={styles.input} placeholder="Event ID" placeholderTextColor={colors.muted} value={eventId} onChangeText={setEventId} />
      <Pressable style={styles.button} onPress={load}><Text style={styles.buttonText}>Load</Text></Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList data={lists} keyExtractor={l => String(l.id)} renderItem={({ item }) => (
        <View style={styles.card}><Text style={styles.cardTitle}>{item.name}</Text></View>
      )} ListEmptyComponent={<Text style={styles.empty}>None.</Text>} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  title: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: spacing.md },
  input: { backgroundColor: colors.surface, color: colors.text, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  button: { backgroundColor: colors.accent, padding: spacing.md, borderRadius: 12, alignItems: 'center', marginBottom: spacing.md },
  buttonText: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm },
  cardTitle: { color: colors.text },
  empty: { color: colors.muted },
  error: { color: colors.danger, marginBottom: spacing.sm },
});
