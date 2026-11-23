import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

const STATUS_COLOR: Record<string, string> = {
  FREE: '#16A34A',
  RESERVED: '#CA8A04',
  SOLD: '#DC2626',
};

export default function SeatSelect() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [map, setMap] = useState<any>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!eventId) return;
    setLoading(true);
    api<any>(`/seat-maps/event/${eventId}`)
      .then(setMap)
      .catch(() => setMap(null))
      .finally(() => setLoading(false));
  };

  useEffect(load, [eventId]);

  const toggle = (seat: any) => {
    if (seat.status !== 'FREE') return;
    setSelected(prev => prev.includes(seat.id) ? prev.filter(id => id !== seat.id) : [...prev, seat.id]);
  };

  const reserve = async () => {
    if (!selected.length) return;
    setMsg('');
    try {
      const d = await api<any>('/seat-maps/reserve', {
        method: 'POST',
        body: JSON.stringify({ seat_ids: selected, idempotency_key: `m-${Date.now()}` }),
      });
      setMsg(`Reserved. Expires in ${d.expires_in_minutes} min. Complete purchase on web.`);
      setSelected([]);
      load();
    } catch (e: any) {
      setMsg(e.detail || 'Seat no longer available');
      load();
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />;
  if (!map?.sectors) return <View style={styles.container}><Text style={styles.empty}>No seat map for this event.</Text></View>;

  const total = map.sectors.flatMap((s: any) => s.rows.flatMap((r: any) => r.seats))
    .filter((s: any) => selected.includes(s.id))
    .reduce((n: number, s: any) => n + (s.price || 0), 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{map.name}</Text>
      <ScrollView>
        {map.sectors.map((sector: any) => (
          <View key={sector.id} style={styles.sector}>
            <Text style={styles.sectorName}>{sector.name}</Text>
            {sector.rows.map((row: any) => (
              <View key={row.id} style={styles.row}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                {row.seats.map((seat: any) => {
                  const isSel = selected.includes(seat.id);
                  return (
                    <Pressable key={seat.id} onPress={() => toggle(seat)} style={[styles.seat, { backgroundColor: isSel ? colors.accent : STATUS_COLOR[seat.status] || '#555' }]}>
                      <Text style={styles.seatText}>{seat.number}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.meta}>{selected.length} selected · {total}</Text>
        <Pressable style={styles.button} onPress={reserve} disabled={!selected.length}>
          <Text style={styles.buttonText}>Reserve</Text>
        </Pressable>
        {msg ? <Text style={styles.msg}>{msg}</Text> : null}
        <Text style={styles.note}>No in-app payment. Finish on the web checkout.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  title: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: spacing.sm },
  sector: { marginBottom: spacing.md },
  sectorName: { color: colors.text, fontWeight: '600', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' },
  rowLabel: { color: colors.muted, width: 28 },
  seat: { width: 28, height: 28, borderRadius: 4, margin: 2, alignItems: 'center', justifyContent: 'center' },
  seatText: { color: '#fff', fontSize: 10 },
  footer: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  meta: { color: colors.text, marginBottom: spacing.sm },
  button: { backgroundColor: colors.accent, padding: spacing.md, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  msg: { color: colors.muted, marginTop: spacing.sm },
  note: { color: colors.muted, fontSize: 11, marginTop: spacing.sm },
  empty: { color: colors.muted },
});
