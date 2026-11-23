import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { api } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<any>('/events/discover').then(setData).catch((e: any) => setError(e.detail || 'Failed'));
  }, []);

  const Section = ({ title, items }: { title: string; items: any[] }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items?.length ? items.map(e => (
        <Pressable key={e.id} style={styles.card} onPress={() => router.push(`/event/${e.slug}`)}>
          <Text style={styles.cardTitle}>{e.title}</Text>
          <Text style={styles.cardMeta}>{e.city} · {e.start_at}</Text>
        </Pressable>
      )) : <Text style={styles.empty}>No events yet.</Text>}
    </View>
  );

  if (!data && !error) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.brand}>BALKAN EVENTS</Text>
      <Pressable style={styles.search} onPress={() => router.push('/(tabs)/discover')}>
        <Text style={styles.searchText}>Search events</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Section title="Popular" items={data?.popular || []} />
      <Section title="Upcoming" items={data?.upcoming || []} />
      <Section title="This Weekend" items={data?.this_weekend || []} />
      <Section title="Recently Added" items={data?.recently_added || []} />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Cities</Text>
        <View style={styles.chips}>
          {(data?.top_cities || []).map((c: any) => (
            <Pressable key={c.city} style={styles.chip} onPress={() => router.push(`/(tabs)/discover?city=${c.city}`)}>
              <Text style={styles.chipText}>{c.city} ({c.count})</Text>
            </Pressable>
          ))}
          {!data?.top_cities?.length && <Text style={styles.empty}>No cities yet.</Text>}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  brand: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: spacing.md },
  search: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  searchText: { color: colors.muted },
  section: { marginBottom: spacing.lg },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm },
  cardTitle: { color: colors.text, fontWeight: '600' },
  cardMeta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  empty: { color: colors.muted, fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderColor: colors.border, borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { color: colors.text, fontSize: 13 },
  error: { color: colors.danger, marginBottom: spacing.sm },
});
