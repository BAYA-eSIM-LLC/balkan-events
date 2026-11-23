import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, FlatList } from 'react-native';
import { router } from 'expo-router';
import { api } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function OrganizerEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const d = await api<any[]>('/organizer/events');
      setEvents(d || []);
    } catch (e: any) {
      setError(e.detail || 'Failed');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My events</Text>
        <Pressable onPress={() => router.push('/organizer/event-create')}><Text style={styles.add}>+ New</Text></Pressable>
      </View>
      <Pressable style={styles.button} onPress={load}><Text style={styles.buttonText}>Load</Text></Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={events}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/organizer/event-edit?eventId=${item.id}`)}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.meta}>{item.status} · {item.city || ''}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No events. Tap Load or create one.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { color: colors.text, fontSize: 22, fontWeight: '700' },
  add: { color: colors.accent, fontWeight: '600' },
  button: { backgroundColor: colors.accent, padding: spacing.md, borderRadius: 12, alignItems: 'center', marginBottom: spacing.md },
  buttonText: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm },
  cardTitle: { color: colors.text, fontWeight: '600' },
  meta: { color: colors.muted, marginTop: 4 },
  empty: { color: colors.muted },
  error: { color: colors.danger, marginBottom: spacing.sm },
});
