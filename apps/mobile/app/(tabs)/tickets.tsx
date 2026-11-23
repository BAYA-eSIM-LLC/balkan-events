import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { api } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function Tickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<any>(null);

  const load = () => {
    setLoading(true);
    api<any[]>('/payments/my-tickets')
      .then(setTickets)
      .catch((e: any) => setError(e.detail || 'Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>My Tickets</Text>
        <Pressable onPress={load}><Text style={styles.refresh}>Refresh</Text></Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={tickets}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => setSelected(item)}>
            {item.qr_data ? <QRCode value={item.qr_data} size={96} /> : null}
            <View style={styles.info}>
              <Text style={styles.title}>Ticket #{item.id}</Text>
              <Text style={styles.meta}>Code: {item.code}</Text>
              <Text style={styles.meta}>Status: {item.is_used ? 'Used' : 'Valid'}</Text>
              {item.seat_id ? <Text style={styles.meta}>Seat #{item.seat_id}</Text> : null}
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No tickets yet. Tickets bought on web appear here.</Text>}
      />
      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.full}>
          <Text style={styles.heading}>Ticket #{selected?.id}</Text>
          {selected?.qr_data ? <QRCode value={selected.qr_data} size={280} /> : null}
          <Text style={styles.meta}>Status: {selected?.is_used ? 'Used' : 'Valid'}</Text>
          <Text style={styles.note}>Show this code at the entrance.</Text>
          <Pressable style={styles.button} onPress={() => setSelected(null)}>
            <Text style={styles.buttonText}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  heading: { color: colors.text, fontSize: 22, fontWeight: '700' },
  refresh: { color: colors.accent },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', gap: 12 },
  info: { flex: 1, justifyContent: 'center' },
  title: { color: colors.text, fontWeight: '600' },
  meta: { color: colors.muted, marginTop: 4 },
  empty: { color: colors.muted },
  error: { color: colors.danger, marginBottom: spacing.sm },
  full: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  note: { color: '#333', marginTop: spacing.md },
  button: { marginTop: spacing.lg, backgroundColor: colors.accent, padding: spacing.md, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
