import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { api } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function Preferences() {
  const [cities, setCities] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api<any>('/me/preferences').then(d => setCities((d.favorite_cities || []).join(', '))).catch(() => {});
  }, []);

  const save = async () => {
    try {
      await api('/me/preferences', {
        method: 'PUT',
        body: JSON.stringify({ favorite_cities: cities.split(',').map(s => s.trim()).filter(Boolean) }),
      });
      setMsg('Saved');
    } catch (e: any) {
      setMsg(e.detail || 'Failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Preferences</Text>
      <Text style={styles.label}>Favorite cities (comma separated)</Text>
      <TextInput style={styles.input} value={cities} onChangeText={setCities} placeholderTextColor={colors.muted} />
      <Pressable style={styles.button} onPress={save}>
        <Text style={styles.buttonText}>Save</Text>
      </Pressable>
      {msg ? <Text style={styles.msg}>{msg}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  heading: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: spacing.md },
  label: { color: colors.muted, marginBottom: spacing.sm },
  input: { backgroundColor: colors.surface, color: colors.text, borderRadius: 10, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  button: { backgroundColor: colors.accent, padding: spacing.md, borderRadius: 12, alignItems: 'center', marginTop: spacing.md },
  buttonText: { color: '#fff', fontWeight: '600' },
  msg: { color: colors.muted, marginTop: spacing.sm },
});
