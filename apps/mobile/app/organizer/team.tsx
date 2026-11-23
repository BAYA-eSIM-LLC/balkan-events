import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, FlatList } from 'react-native';
import { api } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function Team() {
  const [orgId, setOrgId] = useState('');
  const [email, setEmail] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const d = await api<any[]>(`/orgs/${orgId}/members`);
      setMembers(d);
      setMsg('');
    } catch (e: any) {
      setMsg(e.detail || 'Failed');
    }
  };

  const invite = async () => {
    try {
      await api(`/orgs/${orgId}/invite`, { method: 'POST', body: JSON.stringify({ email, role: 'viewer' }) });
      setMsg('Invited');
      load();
    } catch (e: any) {
      setMsg(e.detail || 'Failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Team</Text>
      <TextInput style={styles.input} placeholder="Organization ID" placeholderTextColor={colors.muted} value={orgId} onChangeText={setOrgId} />
      <Pressable style={styles.button} onPress={load}><Text style={styles.buttonText}>Load members</Text></Pressable>
      <FlatList data={members} keyExtractor={m => String(m.id)} renderItem={({ item }) => (
        <Text style={styles.row}>User {item.user_id} — {item.role}</Text>
      )} />
      <TextInput style={styles.input} placeholder="Invite email" placeholderTextColor={colors.muted} value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Pressable style={styles.button} onPress={invite}><Text style={styles.buttonText}>Invite as viewer</Text></Pressable>
      {msg ? <Text style={styles.msg}>{msg}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  title: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: spacing.md },
  input: { backgroundColor: colors.surface, color: colors.text, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  button: { backgroundColor: colors.accent, padding: spacing.md, borderRadius: 12, alignItems: 'center', marginBottom: spacing.md },
  buttonText: { color: '#fff', fontWeight: '600' },
  row: { color: colors.text, marginBottom: 6 },
  msg: { color: colors.muted, marginTop: spacing.sm },
});
