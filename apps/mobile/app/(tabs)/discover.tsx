import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function Discover() {
  const params = useLocalSearchParams<{ city?: string }>();
  const [q, setQ] = useState('');
  const [city, setCity] = useState(params.city || '');
  const [results, setResults] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  const load = async (p: number, append: boolean) => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(p), limit: '12' });
      if (q) params.set('q', q);
      if (city) params.set('city', city);
      const d = await api<any>(`/events/search?${params}`);
      const items = d.results || [];
      setResults(prev => {
        if (!append) return items;
        const ids = new Set(prev.map(x => x.id));
        return [...prev, ...items.filter((x: any) => !ids.has(x.id))];
      });
      setHasMore(items.length === 12);
      setPage(p);
    } catch (e: any) {
      setError(e.detail || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1, false); }, []);

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Search" placeholderTextColor={colors.muted} value={q} onChangeText={setQ} onSubmitEditing={() => load(1, false)} />
      <TextInput style={styles.input} placeholder="City" placeholderTextColor={colors.muted} value={city} onChangeText={setCity} />
      <Pressable style={styles.button} onPress={() => load(1, false)}>
        <Text style={styles.buttonText}>Search</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={results}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/event/${item.slug}`)}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>{item.city}, {item.country}</Text>
          </Pressable>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No results.</Text> : null}
        onEndReached={() => hasMore && load(page + 1, true)}
        onEndReachedThreshold={0.4}
        ListFooterComponent={loading ? <ActivityIndicator color={colors.accent} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  input: { backgroundColor: colors.surface, color: colors.text, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  button: { backgroundColor: colors.accent, padding: spacing.md, borderRadius: 12, alignItems: 'center', marginBottom: spacing.md },
  buttonText: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm },
  title: { color: colors.text, fontWeight: '600' },
  meta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  empty: { color: colors.muted, marginTop: spacing.md },
  error: { color: colors.danger, marginBottom: spacing.sm },
});
