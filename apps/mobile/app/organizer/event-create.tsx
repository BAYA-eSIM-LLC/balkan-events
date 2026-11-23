import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { api } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function CreateEvent() {
  const [orgId, setOrgId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [startAt, setStartAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async () => {
    if (!orgId || !title || !startAt) {
      setError('Organization, title and start date are required');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const d = await api<any>('/organizer/events', {
        method: 'POST',
        body: JSON.stringify({
          organization_id: Number(orgId),
          title,
          short_description: description,
          venue_name: venue,
          start_at: new Date(startAt).toISOString(),
        }),
      });
      setSuccess(`Event ${d.id || ''} created`);
      setTimeout(() => router.back(), 1200);
    } catch (e: any) {
      setError(e.detail || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>New event</Text>
      <TextInput style={styles.input} placeholder="Organization ID" placeholderTextColor={colors.muted} value={orgId} onChangeText={setOrgId} keyboardType="number-pad" />
      <TextInput style={styles.input} placeholder="Title" placeholderTextColor={colors.muted} value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Short description" placeholderTextColor={colors.muted} value={description} onChangeText={setDescription} multiline />
      <TextInput style={styles.input} placeholder="Venue name" placeholderTextColor={colors.muted} value={venue} onChangeText={setVenue} />
      <TextInput style={styles.input} placeholder="Start (YYYY-MM-DDTHH:MM)" placeholderTextColor={colors.muted} value={startAt} onChangeText={setStartAt} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <Pressable style={styles.button} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create</Text>}
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
