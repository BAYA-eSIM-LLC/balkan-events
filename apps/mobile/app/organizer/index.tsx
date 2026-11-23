import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { api } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function OrganizerDashboard() {
  const [orgId, setOrgId] = useState('');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const d = await api<any>(`/analytics/organizer/${orgId}`);
      setData(d);
    } catch (e: any) {
      setError(e.detail || 'Not authorized or failed');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Organizer</Text>
      <TextInput style={styles.input} placeholder="Organization ID" placeholderTextColor={colors.muted} value={orgId} onChangeText={setOrgId} keyboardType="number-pad" />
      <Pressable style={styles.button} onPress={load}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Load dashboard</Text>}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {data && (
        <View style={styles.grid}>
          <View style={styles.kpi}><Text style={styles.kpiLabel}>Revenue</Text><Text style={styles.kpiValue}>{data.revenue}</Text></View>
          <View style={styles.kpi}><Text style={styles.kpiLabel}>Orders</Text><Text style={styles.kpiValue}>{data.orders}</Text></View>
          <View style={styles.kpi}><Text style={styles.kpiLabel}>Tickets</Text><Text style={styles.kpiValue}>{data.tickets}</Text></View>
          <View style={styles.kpi}><Text style={styles.kpiLabel}>POS</Text><Text style={styles.kpiValue}>{data.pos_revenue}</Text></View>
        </View>
      )}
      <Pressable style={styles.link} onPress={() => router.push('/organizer/events')}><Text style={styles.linkText}>Events</Text></Pressable>
      <Pressable style={styles.link} onPress={() => router.push('/organizer/team')}><Text style={styles.linkText}>Team</Text></Pressable>
      <Pressable style={styles.link} onPress={() => router.push('/organizer/guests')}><Text style={styles.linkText}>Guest lists</Text></Pressable>
      <Pressable style={styles.link} onPress={() => router.push('/organizer/pos')}><Text style={styles.linkText}>POS</Text></Pressable>
      <Pressable style={styles.link} onPress={() => router.push('/organizer/scanner')}><Text style={styles.linkText}>Scan tickets</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  title: { color: colors.text, fontSize: 24, fontWeight: '700', marginBottom: spacing.md },
  input: { backgroundColor: colors.surface, color: colors.text, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  button: { backgroundColor: colors.accent, padding: spacing.md, borderRadius: 12, alignItems: 'center', marginBottom: spacing.md },
  buttonText: { color: '#fff', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.lg },
  kpi: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, width: '47%' },
  kpiLabel: { color: colors.muted, fontSize: 12 },
  kpiValue: { color: colors.text, fontSize: 20, fontWeight: '700' },
  link: { borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm },
  linkText: { color: colors.text },
  error: { color: colors.danger, marginBottom: spacing.sm },
});
