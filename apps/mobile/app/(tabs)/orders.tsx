import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { api } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<any[]>('/orders/me').then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>Order #{item.id}</Text>
            <Text style={styles.meta}>Status: {item.status}</Text>
            <Text style={styles.meta}>Total: {item.total_amount} {item.currency}</Text>
            <Text style={styles.meta}>{item.created_at}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No orders.</Text>}
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
  empty: { color: colors.muted },
});
