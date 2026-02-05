import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { api } from '../../lib/api';
import { Bill } from '../../lib/store';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';

export default function BillsScreen() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<string>('');
  const [form, setForm] = useState({
    name: '', amount: '', dueDate: '', recurrence: 'NONE' as string,
  });
  const [saving, setSaving] = useState(false);

  const loadBills = useCallback(async () => {
    try {
      const params = filter ? `?status=${filter}` : '';
      const data = await api.get<Bill[]>(`/bills${params}`);
      setBills(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadBills(); }, [loadBills]);

  const handleCreate = async () => {
    if (!form.name || !form.amount || !form.dueDate) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatorios');
      return;
    }
    setSaving(true);
    try {
      await api.post('/bills', {
        name: form.name,
        amount: parseFloat(form.amount),
        dueDate: form.dueDate,
        recurrence: form.recurrence,
      });
      setShowModal(false);
      setForm({ name: '', amount: '', dueDate: '', recurrence: 'NONE' });
      loadBills();
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handlePay = (id: string, name: string) => {
    Alert.alert('Pagar Conta', `Marcar "${name}" como paga?`, [
      { text: 'Cancelar' },
      {
        text: 'Confirmar',
        onPress: async () => {
          await api.post(`/bills/${id}/pay`);
          loadBills();
        },
      },
    ]);
  };

  const formatCurrency = (value: number) =>
    `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PAID': return { bg: colors.successBg, color: colors.success, label: 'Paga', icon: 'check-circle' as const };
      case 'OVERDUE': return { bg: colors.dangerBg, color: colors.danger, label: 'Vencida', icon: 'alert-circle' as const };
      case 'CANCELLED': return { bg: '#F3F4F6', color: '#6B7280', label: 'Cancelada', icon: 'x-circle' as const };
      default: return { bg: colors.warningBg, color: colors.warning, label: 'Pendente', icon: 'clock' as const };
    }
  };

  const recurrenceLabels: Record<string, string> = {
    NONE: 'Unica', DAILY: 'Diaria', WEEKLY: 'Semanal', MONTHLY: 'Mensal', YEARLY: 'Anual',
  };

  const renderBill = ({ item }: { item: Bill }) => {
    const statusStyle = getStatusStyle(item.status);
    const dueDate = new Date(item.dueDate);
    const isOverdue = item.status === 'PENDING' && dueDate < new Date();

    return (
      <View style={[styles.billCard, isOverdue && styles.billCardOverdue]}>
        <View style={styles.billHeader}>
          <View style={[styles.billIcon, { backgroundColor: statusStyle.bg }]}>
            <Feather name={statusStyle.icon} size={20} color={statusStyle.color} />
          </View>
          <View style={styles.billInfo}>
            <Text style={styles.billName}>{item.name}</Text>
            <View style={styles.billMeta}>
              <Text style={styles.billDate}>{dueDate.toLocaleDateString('pt-BR')}</Text>
              {item.recurrence !== 'NONE' && (
                <View style={styles.recurrenceBadge}>
                  <Feather name="repeat" size={10} color={colors.primary} />
                  <Text style={styles.recurrenceText}>{recurrenceLabels[item.recurrence]}</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.billAmount}>{formatCurrency(item.amount)}</Text>
        </View>

        {item.status === 'PENDING' && (
          <TouchableOpacity style={styles.payButton} onPress={() => handlePay(item.id, item.name)}>
            <Feather name="check" size={16} color="#FFF" />
            <Text style={styles.payButtonText}>Marcar como Paga</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const filterOptions = [
    { value: '', label: 'Todas' },
    { value: 'PENDING', label: 'Pendentes' },
    { value: 'OVERDUE', label: 'Vencidas' },
    { value: 'PAID', label: 'Pagas' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contas</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Feather name="plus" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        {filterOptions.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.filterChip, filter === opt.value && styles.filterChipActive]}
            onPress={() => setFilter(opt.value)}
          >
            <Text style={[styles.filterText, filter === opt.value && styles.filterTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={bills}
          keyExtractor={item => item.id}
          renderItem={renderBill}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="calendar" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Nenhuma conta registrada</Text>
            </View>
          }
        />
      )}

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nova Conta</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TextInput style={styles.modalInput} placeholder="Nome da conta" placeholderTextColor={colors.textMuted}
            value={form.name} onChangeText={v => setForm({ ...form, name: v })} />

          <TextInput style={styles.modalInput} placeholder="Valor" placeholderTextColor={colors.textMuted}
            value={form.amount} onChangeText={v => setForm({ ...form, amount: v })} keyboardType="decimal-pad" />

          <TextInput style={styles.modalInput} placeholder="Vencimento (YYYY-MM-DD)" placeholderTextColor={colors.textMuted}
            value={form.dueDate} onChangeText={v => setForm({ ...form, dueDate: v })} />

          <Text style={styles.modalLabel}>Recorrencia</Text>
          <View style={styles.recurrenceOptions}>
            {(['NONE', 'MONTHLY', 'WEEKLY', 'YEARLY'] as const).map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.recurrenceChip, form.recurrence === r && styles.recurrenceChipActive]}
                onPress={() => setForm({ ...form, recurrence: r })}
              >
                <Text style={[styles.recurrenceChipText, form.recurrence === r && styles.recurrenceChipTextActive]}>
                  {recurrenceLabels[r]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleCreate} disabled={saving}>
            {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Criar Conta</Text>}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.sm,
  },
  title: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text },
  addButton: {
    width: 44, height: 44, borderRadius: borderRadius.full,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  filters: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md },
  filterChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.full, backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: fontSize.sm, color: colors.textSecondary },
  filterTextActive: { color: '#FFF', fontWeight: '600' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  billCard: {
    backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  billCardOverdue: { borderLeftWidth: 3, borderLeftColor: colors.danger },
  billHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  billIcon: { width: 42, height: 42, borderRadius: borderRadius.sm, justifyContent: 'center', alignItems: 'center' },
  billInfo: { flex: 1 },
  billName: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  billMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
  billDate: { fontSize: fontSize.xs, color: colors.textMuted },
  recurrenceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: colors.primaryBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: borderRadius.full,
  },
  recurrenceText: { fontSize: 10, color: colors.primary, fontWeight: '500' },
  billAmount: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  payButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    backgroundColor: colors.success, paddingVertical: spacing.sm, borderRadius: borderRadius.sm,
    marginTop: spacing.md,
  },
  payButtonText: { color: '#FFF', fontSize: fontSize.sm, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60, gap: spacing.sm },
  emptyText: { fontSize: fontSize.md, color: colors.textMuted },
  modalContainer: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: 60 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  modalTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  modalInput: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontSize: fontSize.md, color: colors.text, marginBottom: spacing.md,
  },
  modalLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  recurrenceOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  recurrenceChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card,
  },
  recurrenceChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryBg },
  recurrenceChipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  recurrenceChipTextActive: { color: colors.primary, fontWeight: '600' },
  saveButton: {
    backgroundColor: colors.primary, paddingVertical: spacing.md,
    borderRadius: borderRadius.md, alignItems: 'center',
  },
  saveButtonText: { color: '#FFF', fontSize: fontSize.lg, fontWeight: '600' },
});
