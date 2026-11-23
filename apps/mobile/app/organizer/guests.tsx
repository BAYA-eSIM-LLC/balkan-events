import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { api } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function Guests() {
  const [eventId, setEventId] = useState('');
  const [lists, setLists] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<number | null>(null);
  const [guests, setGuests] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadLists = async () => {
    if (!eventId) return;
    setLoading(true);
    setError('');
    try {
      const d = await api<any[]>(`/guest-lists/event/${eventId}`);
      setLists(d);
      if (d.length) setSelectedList(d[0].id);
    } catch (e: any) {
      setError(e.detail || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const loadGuests = async () => {
    if (!selectedList) return;
    setLoading(true);
    try {
      const q = query ? `?q=${encodeURIComponent(query)}` : '';
      const d = await api<any[]>(`/guest-lists/${selectedList}/guests${q}`);
      setGuests(d);
    } catch (e: any) {
      setError(e.detail || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const addGuest = async () => {
    if (!selectedList || !firstName || !lastName) return;
    setLoading(true);
    try {
      await api(`/guest-lists/${selectedList}/guests`, {
        method: 'POST',
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email: email || null }),
      });
      setFirstName('');
      setLastName('');
      setEmail('');
      loadGuests();
    } catch (e: any) {
      setError(e.detail || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const checkIn = async (guestId: number) => {
    setLoading(true);
    try {
      await api(`/guest-lists/guests/${guestId}/check-in`, { method: 'POST' });
      loadGuests();
    } catch (e: any) {
      setError(e.detail || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Guest lists</Text>
      <TextInput style={styles.input} placeholder="Event ID" placeholderTextColor={colors.muted} value={eventId} onChangeText={setEventId} keyboardType="number-pad" />
      <Pressable style={styles.button} onPress={loadLists}><Text style={styles.buttonText}>Load lists</Text></Pressable>
      {loading ? <ActivityIndicator color={colors.accent} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {lists.map(l => (
        <Pressable key={l.id} style={[styles.listChip, selectedList === l.id && styles.listChipActive]} onPress={() => setSelectedList(l.id)}>
          <Text style={styles.listText}>{l.name}</Text>
        </Pressable>
      ))}
      {selectedList ? (
        <>
          <Pressable style={styles.button} onPress={loadGuests}><Text style={styles.buttonText}>Load guests</Text></Pressable>
          <TextInput style={styles.input} placeholder="Search" placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} onSubmitEditing={loadGuests} />
          <FlatList
            data={guests}
            keyExtractor={g => String(g.id)}
            renderItem={({ item }) => (
              <View style={styles.guest}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guestName}>{item.first_name} {item.last_name}</Text>
                  <Text style={styles.meta}>{item.email || ''}</Text>
                </View>
                {item.checked_in ? (
                  <Text style={styles.checked}>Checked in</Text>
                ) : (
                  <Pressable onPress={() => checkIn(item.id)}><Text style={styles.checkIn}>Check in</Text></Pressable>
                )}
              </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No guests.</Text>}
            style={{ maxHeight: 240 }}
          />
          <Text style={styles.section}>Add guest</Text>
          <TextInput style={styles.input} placeholder="First name" placeholderTextColor={colors.muted} value={firstName} onChangeText={setFirstName} />
          <TextInput style={styles.input} placeholder="Last name" placeholderTextColor={colors.muted} value={lastName} onChangeText={setLastName} />
          <TextInput style={styles.input} placeholder="Email (optional)" placeholderTextColor={colors.muted} value={email} onChangeText={setEmail} autoCapitalize="none" />
          <Pressable style={styles.button} onPress={addGuest}><Text style={styles.buttonText}>Add</Text></Pressable>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  title: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: spacing.md },
  input: { backgroundColor: colors.surface, color: colors.text, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  button: { backgroundColor: colors.accent, padding: spacing.md, borderRadius: 12, alignItems: 'center', marginBottom: spacing.sm },
  buttonText: { color: '#fff', fontWeight: '600' },
  listChip: { borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: spacing.sm, marginBottom: 4 },
  listChipActive: { borderColor: colors.accent },
  listText: { color: colors.text },
  guest: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 10, padding: spacing.sm, marginBottom: 4 },
  guestName: { color: colors.text, fontWeight: '600' },
  meta: { color: colors.muted, fontSize: 12 },
  checked: { color: colors.success, fontSize: 12 },
  checkIn: { color: colors.accent, fontWeight: '600' },
  section: { color: colors.text, fontWeight: '600', marginTop: spacing.md, marginBottom: spacing.sm },
  empty: { color: colors.muted },
  error: { color: colors.danger, marginBottom: spacing.sm },
});
