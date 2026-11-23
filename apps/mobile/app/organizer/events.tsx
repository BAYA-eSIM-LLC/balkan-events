import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, FlatList } from 'react-native';
import { api } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function OrganizerEvents() {
  const [orgId, setOrgId] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const d = await api<any>(`/organizer/organizations/${orgId}`);
      setEvents(d.events || []);
    } catch (e: any) {
      setError(e.detail || 'Failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My events</Text>
      <TextInput style={styles.input} placeholder="Organization ID" placeholderTextColor={colors.muted} value={orgId} onChangeText={setOrgId} />
      <Pressable style={styles.button} onPress={load}><Text style={styles.buttonText}>Load</Text></Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={events}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.meta}>{item.status}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No events.</Text>}
      />
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
  cardTitle: { color: colors.text, fontWeight: '600' },
  meta: { color: colors.muted, marginTop: 4 },
  empty: { color: colors.muted },
  error: { color: colors.danger, marginBottom: spacing.sm },
});
