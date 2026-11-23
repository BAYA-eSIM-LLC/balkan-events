import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, ActivityIndicator, Modal } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { api } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function POSSale() {
  const [orgId, setOrgId] = useState('');
  const [points, setPoints] = useState<any[]>([]);
  const [pointId, setPointId] = useState<number | null>(null);
  const [registerId, setRegisterId] = useState<number | null>(null);
  const [eventId, setEventId] = useState('');
  const [types, setTypes] = useState<any[]>([]);
  const [typeId, setTypeId] = useState<number | null>(null);
  const [qty, setQty] = useState('1');
  const [received, setReceived] = useState('');
  const [opening, setOpening] = useState('0');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQr, setShowQr] = useState<string | null>(null);

  const loadPoints = async () => {
    setLoading(true);
    setError('');
    try {
      const d = await api<any[]>(`/pos/sales-points?organization_id=${orgId}`);
      setPoints(d);
    } catch (e: any) {
      setError(e.detail || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const openRegister = async () => {
    if (!pointId) return;
    setLoading(true);
    setError('');
    try {
      const d = await api<any>('/pos/registers/open', {
        method: 'POST',
        body: JSON.stringify({ sales_point_id: pointId, opening_balance: Number(opening) || 0 }),
      });
      setRegisterId(d.id);
    } catch (e: any) {
      setError(e.detail || 'Failed to open');
    } finally {
      setLoading(false);
    }
  };

  const closeRegister = async () => {
    if (!registerId) return;
    setLoading(true);
    try {
      const d = await api<any>(`/pos/registers/${registerId}/close`, {
        method: 'POST',
        body: JSON.stringify({ closing_balance: Number(received) || 0 }),
      });
      setResult({ closed: true, ...d });
      setRegisterId(null);
    } catch (e: any) {
      setError(e.detail || 'Failed to close');
    } finally {
      setLoading(false);
    }
  };

  const loadTypes = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const d = await api<any[]>(`/organizer/events/${eventId}/ticket-types`);
      setTypes(d);
    } catch (e: any) {
      setError(e.detail || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const sell = async () => {
    if (!pointId || !registerId || !typeId) {
      setError('Select point, open register and choose ticket type');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const d = await api<any>('/pos/sale', {
        method: 'POST',
        body: JSON.stringify({
          sales_point_id: pointId,
          register_id: registerId,
          ticket_type_id: typeId,
          quantity: Number(qty) || 1,
          payment_method: 'CASH',
          idempotency_key: `pos-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        }),
      });
      setResult(d);
    } catch (e: any) {
      setError(e.detail || 'Sale failed');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = types.find(t => t.id === typeId);
  const total = selectedType ? Number(selectedType.price) * (Number(qty) || 1) : 0;
  const change = received ? Math.max(0, Number(received) - total) : 0;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>POS</Text>
      <Text style={styles.note}>Cash only. Backend is the authority.</Text>
      <TextInput style={styles.input} placeholder="Organization ID" placeholderTextColor={colors.muted} value={orgId} onChangeText={setOrgId} keyboardType="number-pad" />
      <Pressable style={styles.button} onPress={loadPoints}><Text style={styles.buttonText}>Load sales points</Text></Pressable>
      {points.map(p => (
        <Pressable key={p.id} style={[styles.chip, pointId === p.id && styles.chipActive]} onPress={() => setPointId(p.id)}>
          <Text style={styles.chipText}>{p.name}</Text>
        </Pressable>
      ))}
      {pointId && !registerId && (
        <>
          <TextInput style={styles.input} placeholder="Opening balance" placeholderTextColor={colors.muted} value={opening} onChangeText={setOpening} keyboardType="decimal-pad" />
          <Pressable style={styles.button} onPress={openRegister}><Text style={styles.buttonText}>Open register</Text></Pressable>
        </>
      )}
      {registerId && <Text style={styles.ok}>Register #{registerId} open</Text>}
      <TextInput style={styles.input} placeholder="Event ID" placeholderTextColor={colors.muted} value={eventId} onChangeText={setEventId} keyboardType="number-pad" />
      <Pressable style={styles.button} onPress={loadTypes}><Text style={styles.buttonText}>Load ticket types</Text></Pressable>
      {types.map(t => (
        <Pressable key={t.id} style={[styles.chip, typeId === t.id && styles.chipActive]} onPress={() => setTypeId(t.id)}>
          <Text style={styles.chipText}>{t.name} — {t.price}</Text>
        </Pressable>
      ))}
      <TextInput style={styles.input} placeholder="Quantity" placeholderTextColor={colors.muted} value={qty} onChangeText={setQty} keyboardType="number-pad" />
      <Text style={styles.total}>Total: {total.toFixed(2)}</Text>
      <TextInput style={styles.input} placeholder="Cash received" placeholderTextColor={colors.muted} value={received} onChangeText={setReceived} keyboardType="decimal-pad" />
      {received ? <Text style={styles.total}>Change: {change.toFixed(2)}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <ActivityIndicator color={colors.accent} /> : null}
      <Pressable style={styles.button} onPress={sell} disabled={loading || !registerId}>
        <Text style={styles.buttonText}>Confirm cash sale</Text>
      </Pressable>
      {registerId && (
        <Pressable style={styles.secondary} onPress={closeRegister}>
          <Text style={styles.secondaryText}>Close register</Text>
        </Pressable>
      )}
      {result?.status === 'ok' && (
        <View style={styles.confirm}>
          <Text style={styles.confirmTitle}>Sale confirmed</Text>
          <Text style={styles.meta}>Order #{result.order_id} · {result.reference}</Text>
          <Text style={styles.meta}>Total {result.total}</Text>
          {(result.tickets || []).map((code: string) => (
            <Pressable key={code} style={styles.ticket} onPress={() => setShowQr(`BE:${code}:${result.order_id}`)}>
              <Text style={styles.ticketText}>Ticket {code.slice(0, 8)}…</Text>
            </Pressable>
          ))}
        </View>
      )}
      {result?.closed && (
        <View style={styles.confirm}>
          <Text style={styles.confirmTitle}>Register closed</Text>
          <Text style={styles.meta}>Expected {result.expected} · Actual {result.actual} · Variance {result.variance}</Text>
        </View>
      )}
      <Modal visible={!!showQr} animationType="slide" onRequestClose={() => setShowQr(null)}>
        <View style={styles.full}>
          {showQr ? <QRCode value={showQr} size={260} /> : null}
          <Text style={styles.meta}>{showQr}</Text>
          <Pressable style={styles.button} onPress={() => setShowQr(null)}><Text style={styles.buttonText}>Close</Text></Pressable>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  title: { color: colors.text, fontSize: 22, fontWeight: '700' },
  note: { color: colors.muted, fontSize: 12, marginBottom: spacing.md },
  input: { backgroundColor: colors.surface, color: colors.text, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  button: { backgroundColor: colors.accent, padding: spacing.md, borderRadius: 12, alignItems: 'center', marginBottom: spacing.sm },
  buttonText: { color: '#fff', fontWeight: '600' },
  secondary: { borderColor: colors.border, borderWidth: 1, padding: spacing.md, borderRadius: 12, alignItems: 'center', marginBottom: spacing.sm },
  secondaryText: { color: colors.text },
  chip: { borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: spacing.sm, marginBottom: 4 },
  chipActive: { borderColor: colors.accent },
  chipText: { color: colors.text },
  ok: { color: colors.success, marginBottom: spacing.sm },
  total: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.sm },
  error: { color: colors.danger, marginBottom: spacing.sm },
  confirm: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginTop: spacing.md },
  confirmTitle: { color: colors.success, fontSize: 18, fontWeight: '700' },
  meta: { color: colors.muted, marginTop: 4 },
  ticket: { marginTop: spacing.sm, padding: spacing.sm, borderColor: colors.border, borderWidth: 1, borderRadius: 8 },
  ticketText: { color: colors.text },
  full: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
});
