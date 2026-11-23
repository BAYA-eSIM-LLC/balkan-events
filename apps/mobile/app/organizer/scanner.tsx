import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Vibration } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { api } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

const COLORS: Record<string, string> = {
  VALID: '#16A34A',
  ALREADY_USED: '#CA8A04',
  WRONG_EVENT: '#DC2626',
  INVALID: '#DC2626',
  QUEUED: '#A1A1AA',
};

export default function MobileScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [eventId, setEventId] = useState('');
  const [entryPointId, setEntryPointId] = useState('');
  const [manual, setManual] = useState('');
  const [result, setResult] = useState<any>(null);
  const [offline, setOffline] = useState(false);
  const [counts, setCounts] = useState({ valid: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);
  const last = useRef<{ code: string; at: number }>({ code: '', at: 0 });
  const queue = useRef<any[]>([]);

  const beep = (ok: boolean) => {
    Vibration.vibrate(ok ? 80 : [0, 80, 60, 80]);
  };

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  const validate = async (code: string) => {
    const now = Date.now();
    if (code === last.current.code && now - last.current.at < 2500) return;
    last.current = { code, at: now };
    if (!eventId) {
      setResult({ status: 'INVALID', reason: 'Select an event first' });
      return;
    }
    if (offline) {
      queue.current.push({ qr_data: code, event_id: Number(eventId), entry_point_id: entryPointId ? Number(entryPointId) : null, scanned_at: new Date().toISOString() });
      setResult({ status: 'QUEUED', note: 'Queued locally. Not a confirmed entry. Sync when online. Double entry across devices cannot be prevented without a connection.' });
      return;
    }
    setLoading(true);
    try {
      const body: any = { qr_data: code, event_id: Number(eventId) };
      if (entryPointId) body.entry_point_id = Number(entryPointId);
      const d = await api<any>('/scanner/validate', { method: 'POST', body: JSON.stringify(body) });
      setResult(d);
      beep(d.status === 'VALID');
      setCounts(c => d.status === 'VALID' ? { ...c, valid: c.valid + 1 } : { ...c, rejected: c.rejected + 1 });
    } catch (e: any) {
      setResult({ status: 'INVALID', reason: e.detail || 'Network error' });
      setCounts(c => ({ ...c, rejected: c.rejected + 1 }));
    } finally {
      setLoading(false);
    }
  };

  const onBarcode = (e: { data: string }) => {
    if (e?.data) validate(e.data);
  };

  const bg = result ? COLORS[result.status] || colors.surface : 'transparent';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QR Scanner</Text>
      <View style={styles.row}>
        <TextInput style={styles.input} placeholder="Event ID" placeholderTextColor={colors.muted} value={eventId} onChangeText={setEventId} keyboardType="number-pad" />
        <TextInput style={styles.input} placeholder="Entry point" placeholderTextColor={colors.muted} value={entryPointId} onChangeText={setEntryPointId} keyboardType="number-pad" />
      </View>
      <Pressable style={styles.toggle} onPress={() => setOffline(o => !o)}>
        <Text style={styles.toggleText}>{offline ? 'Offline ON — not confirmed' : 'Online'}</Text>
      </Pressable>
      <View style={styles.frame}>
        {permission?.granted ? (
          <CameraView style={StyleSheet.absoluteFill} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={onBarcode} />
        ) : (
          <Pressable style={styles.center} onPress={requestPermission}>
            <Text style={styles.muted}>Camera permission required</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.counts}>Valid {counts.valid} · Rejected {counts.rejected} · Queued {queue.current.length}</Text>
      <Pressable style={styles.button} onPress={async () => {
        if (!queue.current.length) return;
        try {
          const d = await api<any>('/scanner/offline/sync', { method: 'POST', body: JSON.stringify(queue.current) });
          queue.current = [];
          setResult({ status: 'VALID', reason: `Synced. Server is authority.` });
          beep(true);
        } catch (e: any) {
          setResult({ status: 'INVALID', reason: e.detail || 'Sync failed' });
        }
      }}><Text style={styles.buttonText}>Sync queued</Text></Pressable>
      <TextInput style={styles.manual} placeholder="Manual code" placeholderTextColor={colors.muted} value={manual} onChangeText={setManual} />
      <Pressable style={styles.button} onPress={() => validate(manual)} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Scan code</Text>}
      </Pressable>
      {result && (
        <View style={[styles.result, { backgroundColor: bg }]}>
          <Text style={styles.resultText}>{result.status}</Text>
          {result.reason ? <Text style={styles.resultNote}>{result.reason}</Text> : null}
          {result.note ? <Text style={styles.resultNote}>{result.note}</Text> : null}
          {result.ticket_id ? <Text style={styles.resultNote}>Ticket #{result.ticket_id}</Text> : null}
          <Pressable onPress={() => setResult(null)}><Text style={styles.dismiss}>Scan next</Text></Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  title: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: colors.surface, color: colors.text, borderRadius: 10, padding: spacing.sm, borderWidth: 1, borderColor: colors.border },
  toggle: { marginVertical: spacing.sm, alignSelf: 'flex-start' },
  toggleText: { color: colors.muted },
  frame: { height: 260, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000', marginBottom: spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.muted },
  counts: { color: colors.muted, marginBottom: spacing.sm },
  manual: { backgroundColor: colors.surface, color: colors.text, borderRadius: 10, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  button: { backgroundColor: colors.accent, padding: spacing.md, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  result: { marginTop: spacing.md, borderRadius: 12, padding: spacing.md, alignItems: 'center' },
  resultText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  resultNote: { color: '#fff', marginTop: 4, textAlign: 'center' },
  dismiss: { color: '#fff', marginTop: spacing.sm, textDecorationLine: 'underline' },
});
