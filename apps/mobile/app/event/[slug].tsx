import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function EventDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [event, setEvent] = useState<any>(null);
  const [seatMap, setSeatMap] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    api<any>(`/events/${slug}`).then(setEvent).catch((e: any) => setError(e.detail || 'Not found'));
  }, [slug]);

  useEffect(() => {
    if (!event?.id) return;
    api<any>(`/seat-maps/event/${event.id}`).then(setSeatMap).catch(() => setSeatMap(null));
  }, [event?.id]);

  if (!event && !error) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />;
  if (error) return <View style={styles.container}><Text style={styles.error}>{error}</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.meta}>{event.city}, {event.country}</Text>
      <Text style={styles.meta}>{event.start_at}</Text>
      {event.venue_name ? <Text style={styles.meta}>{event.venue_name}</Text> : null}
      {event.short_description ? <Text style={styles.body}>{event.short_description}</Text> : null}
      {seatMap?.sectors ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seat map</Text>
          {seatMap.sectors.map((s: any) => (
            <Text key={s.id} style={styles.meta}>{s.name} — {s.rows?.reduce((n: number, r: any) => n + (r.seats?.length || 0), 0) || 0} seats</Text>
          ))}
        </View>
      ) : null}
      <Text style={styles.note}>Purchase uses the existing web checkout. No in-app payment in this phase.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  title: { color: colors.text, fontSize: 24, fontWeight: '700' },
  meta: { color: colors.muted, marginTop: 4 },
  body: { color: colors.text, marginTop: spacing.md, lineHeight: 20 },
  section: { marginTop: spacing.lg },
  sectionTitle: { color: colors.text, fontWeight: '600', marginBottom: spacing.sm },
  note: { color: colors.muted, fontSize: 12, marginTop: spacing.lg },
  error: { color: colors.danger },
});
