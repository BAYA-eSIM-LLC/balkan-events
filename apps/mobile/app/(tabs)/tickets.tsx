import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { api } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function Tickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api<any[]>('/payments/my-tickets')
      .then(setTickets)
      .catch((e: any) => setError(e.detail || 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Tickets</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={tickets}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>Ticket #{item.id}</Text>
            <Text style={styles.meta}>Code: {item.code}</Text>
            <Text style={styles.meta}>Status: {item.is_used ? 'Used' : 'Valid'}</Text>
            <Text style={styles.qr}>{item.qr_data}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No tickets yet. Tickets bought on web appear here.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  heading: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm },
  title: { color: colors.text, fontWeight: '600' },
  meta: { color: colors.muted, marginTop: 4 },
  qr: { color: colors.text, fontSize: 11, marginTop: spacing.sm, fontFamily: 'monospace' },
  empty: { color: colors.muted },
  error: { color: colors.danger, marginBottom: spacing.sm },
});
