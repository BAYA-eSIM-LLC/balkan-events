import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { api } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function EditEvent() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!eventId) return;
    api<any>(`/organizer/events/${eventId}`)
      .then(e => {
        setTitle(e.title || '');
        setDescription(e.short_description || '');
        setVenue(e.venue_name || '');
      })
      .catch((e: any) => setError(e.detail || 'Not found'))
      .finally(() => setLoading(false));
  }, [eventId]);

  const save = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api(`/organizer/events/${eventId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title, short_description: description, venue_name: venue }),
      });
      setSuccess('Saved');
      setTimeout(() => router.back(), 800);
    } catch (e: any) {
      setError(e.detail || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit event</Text>
      <TextInput style={styles.input} placeholder="Title" placeholderTextColor={colors.muted} value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Short description" placeholderTextColor={colors.muted} value={description} onChangeText={setDescription} multiline />
      <TextInput style={styles.input} placeholder="Venue" placeholderTextColor={colors.muted} value={venue} onChangeText={setVenue} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <Pressable style={styles.button} onPress={save} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  title: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: spacing.md },
  input: { backgroundColor: colors.surface, color: colors.text, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  button: { backgroundColor: colors.accent, padding: spacing.md, borderRadius: 12, alignItems: 'center', marginTop: spacing.sm },
  buttonText: { color: '#fff', fontWeight: '600' },
  error: { color: colors.danger, marginBottom: spacing.sm },
  success: { color: colors.success, marginBottom: spacing.sm },
});
