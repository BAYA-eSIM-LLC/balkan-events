import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { authApi } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async () => {
    try {
      await authApi.forgot(email.trim());
      setMsg('If the account exists, a reset was sent.');
    } catch (e: any) {
      setMsg(e.detail || 'Request failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot password</Text>
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.muted} autoCapitalize="none" value={email} onChangeText={setEmail} />
      <Pressable style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Send reset</Text>
      </Pressable>
      {msg ? <Text style={styles.msg}>{msg}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  title: { color: colors.text, fontSize: 24, fontWeight: '700', marginBottom: spacing.lg },
  input: { backgroundColor: colors.surface, color: colors.text, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  button: { backgroundColor: colors.accent, padding: spacing.md, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  msg: { color: colors.muted, marginTop: spacing.md },
});
