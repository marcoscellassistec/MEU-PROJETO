import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { api } from '../../lib/api';
import { Transaction, Category } from '../../lib/store';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeType, setActiveType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [form, setForm] = useState({ amount: '', description: '', categoryId: '' });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [txData, catData] = await Promise.all([
        api.get<{ transactions: Transaction[] }>('/transactions?limit=50'),
        api.get<Category[]>('/categories'),
      ]);
      setTransactions(txData.transactions);
      setCategories(catData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async () => {
    if (!form.amount || !form.description || !form.categoryId) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    setSaving(true);
    try {
      await api.post('/transactions', {
        amount: parseFloat(form.amount),
        type: activeType,
        description: form.description,
        categoryId: form.categoryId,
      });
      setShowModal(false);
      setForm({ amount: '', description: '', categoryId: '' });
      loadData();
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Excluir', 'Deseja excluir esta transacao?', [
      { text: 'Cancelar' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          await api.delete(`/transactions/${id}`);
          loadData();
        },
      },
    ]);
  };

  const formatCurrency = (value: number) =>
    `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

  const filteredCategories = categories.filter(c => c.type === activeType);

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity style={styles.txRow} onLongPress={() => handleDelete(item.id)}>
      <View style={[styles.txIcon, { backgroundColor: item.category.color + '20' }]}>
        <Feather name={item.category.icon as any} size={18} color={item.category.color} />
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txDescription}>{item.description}</Text>
        <Text style={styles.txCategory}>{item.category.name}</Text>
      </View>
      <View style={styles.txAmountContainer}>
        <Text style={[styles.txAmount, { color: item.type === 'INCOME' ? colors.income : colors.expense }]}>
          {item.type === 'INCOME' ? '+' : '-'}{formatCurrency(item.amount)}
        </Text>
        <Text style={styles.txDate}>{new Date(item.date).toLocaleDateString('pt-BR')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transacoes</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Feather name="plus" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={renderTransaction}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="inbox" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Nenhuma transacao ainda</Text>
            </View>
          }
        />
      )}

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nova Transacao</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[styles.typeButton, activeType === 'EXPENSE' && styles.typeButtonActiveExpense]}
              onPress={() => setActiveType('EXPENSE')}
            >
              <Text style={[styles.typeText, activeType === 'EXPENSE' && styles.typeTextActive]}>Saida</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, activeType === 'INCOME' && styles.typeButtonActiveIncome]}
              onPress={() => setActiveType('INCOME')}
            >
              <Text style={[styles.typeText, activeType === 'INCOME' && styles.typeTextActive]}>Entrada</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.amountInput}
            placeholder="0,00"
            placeholderTextColor={colors.textMuted}
            value={form.amount}
            onChangeText={v => setForm({ ...form, amount: v })}
            keyboardType="decimal-pad"
          />

          <TextInput
            style={styles.modalInput}
            placeholder="Descricao"
            placeholderTextColor={colors.textMuted}
            value={form.description}
            onChangeText={v => setForm({ ...form, description: v })}
          />

          <Text style={styles.modalLabel}>Categoria</Text>
          <View style={styles.categoriesGrid}>
            {filteredCategories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, form.categoryId === cat.id && { borderColor: cat.color, backgroundColor: cat.color + '15' }]}
                onPress={() => setForm({ ...form, categoryId: cat.id })}
              >
                <Feather name={cat.icon as any} size={16} color={cat.color} />
                <Text style={[styles.categoryChipText, form.categoryId === cat.id && { color: cat.color }]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleCreate} disabled={saving}>
            {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Salvar</Text>}
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
    paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md,
  },
  title: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text },
  addButton: {
    width: 44, height: 44, borderRadius: borderRadius.full,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  txRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  txIcon: { width: 42, height: 42, borderRadius: borderRadius.sm, justifyContent: 'center', alignItems: 'center' },
  txInfo: { flex: 1 },
  txDescription: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  txCategory: { fontSize: fontSize.xs, color: colors.textMuted },
  txAmountContainer: { alignItems: 'flex-end' },
  txAmount: { fontSize: fontSize.md, fontWeight: '700' },
  txDate: { fontSize: fontSize.xs, color: colors.textMuted },
  empty: { alignItems: 'center', paddingTop: 60, gap: spacing.md },
  emptyText: { fontSize: fontSize.md, color: colors.textMuted },
  modalContainer: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: 60 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  modalTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  typeToggle: {
    flexDirection: 'row', backgroundColor: colors.borderLight,
    borderRadius: borderRadius.md, padding: 4, marginBottom: spacing.lg,
  },
  typeButton: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: borderRadius.sm },
  typeButtonActiveExpense: { backgroundColor: colors.expense },
  typeButtonActiveIncome: { backgroundColor: colors.income },
  typeText: { fontSize: fontSize.md, fontWeight: '600', color: colors.textSecondary },
  typeTextActive: { color: '#FFF' },
  amountInput: {
    fontSize: 42, fontWeight: '700', color: colors.text,
    textAlign: 'center', marginBottom: spacing.lg,
  },
  modalInput: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontSize: fontSize.md, color: colors.text, marginBottom: spacing.md,
  },
  modalLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.card,
  },
  categoryChipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  saveButton: {
    backgroundColor: colors.primary, paddingVertical: spacing.md,
    borderRadius: borderRadius.md, alignItems: 'center',
  },
  saveButtonText: { color: '#FFF', fontSize: fontSize.lg, fontWeight: '600' },
});
