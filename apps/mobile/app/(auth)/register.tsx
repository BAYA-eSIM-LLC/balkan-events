import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { authApi } from '../../src/services/api';
import { saveTokens } from '../../src/services/tokenStore';
import { colors, spacing } from '../../src/theme';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const tokens = await authApi.register(email.trim(), password, name.trim());
      await saveTokens(tokens.access_token, tokens.refresh_token);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.hint}>Same account works on web and mobile</Text>
      <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={colors.muted} value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.muted} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor={colors.muted} secureTextEntry value={password} onChangeText={setPassword} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.button} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  title: { color: colors.text, fontSize: 24, fontWeight: '700', marginBottom: spacing.xs },
  hint: { color: colors.muted, marginBottom: spacing.lg },
  input: { backgroundColor: colors.surface, color: colors.text, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  button: { backgroundColor: colors.accent, padding: spacing.md, borderRadius: 12, alignItems: 'center', marginTop: spacing.sm },
  buttonText: { color: '#fff', fontWeight: '600' },
  error: { color: colors.danger, marginBottom: spacing.sm },
});
