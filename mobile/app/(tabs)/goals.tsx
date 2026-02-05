import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { api } from '../../lib/api';
import { Goal } from '../../lib/store';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeposit, setShowDeposit] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [form, setForm] = useState({ name: '', targetAmount: '', deadline: '' });
  const [saving, setSaving] = useState(false);

  const loadGoals = useCallback(async () => {
    try {
      const data = await api.get<Goal[]>('/goals');
      setGoals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGoals(); }, [loadGoals]);

  const handleCreate = async () => {
    if (!form.name || !form.targetAmount) {
      Alert.alert('Erro', 'Preencha nome e valor da meta');
      return;
    }
    setSaving(true);
    try {
      await api.post('/goals', {
        name: form.name,
        targetAmount: parseFloat(form.targetAmount),
        deadline: form.deadline || undefined,
      });
      setShowModal(false);
      setForm({ name: '', targetAmount: '', deadline: '' });
      loadGoals();
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeposit = async (goalId: string) => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      Alert.alert('Erro', 'Valor deve ser positivo');
      return;
    }
    try {
      await api.post(`/goals/${goalId}/deposit`, { amount: parseFloat(depositAmount) });
      setShowDeposit(null);
      setDepositAmount('');
      loadGoals();
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao depositar');
    }
  };

  const formatCurrency = (value: number) =>
    `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

  const renderGoal = ({ item }: { item: Goal }) => {
    const progress = item.targetAmount > 0 ? (item.currentAmount / item.targetAmount) * 100 : 0;
    return (
      <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={[styles.goalIcon, { backgroundColor: item.color + '20' }]}>
            <Feather name={item.isCompleted ? 'check-circle' : 'target'} size={20} color={item.color} />
          </View>
          <View style={styles.goalInfo}>
            <Text style={styles.goalName}>{item.name}</Text>
            {item.deadline && (
              <Text style={styles.goalDeadline}>
                Prazo: {new Date(item.deadline).toLocaleDateString('pt-BR')}
              </Text>
            )}
          </View>
          {item.isCompleted ? (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>Concluida!</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.depositButton}
              onPress={() => setShowDeposit(item.id)}
            >
              <Feather name="plus" size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: item.color }]} />
          </View>
          <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
        </View>

        <View style={styles.goalValues}>
          <Text style={styles.goalCurrent}>{formatCurrency(item.currentAmount)}</Text>
          <Text style={styles.goalTarget}>de {formatCurrency(item.targetAmount)}</Text>
        </View>

        {showDeposit === item.id && (
          <View style={styles.depositRow}>
            <TextInput
              style={styles.depositInput}
              placeholder="Valor"
              keyboardType="decimal-pad"
              value={depositAmount}
              onChangeText={setDepositAmount}
            />
            <TouchableOpacity style={styles.depositConfirm} onPress={() => handleDeposit(item.id)}>
              <Feather name="check" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Metas</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Feather name="plus" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={goals}
          keyExtractor={item => item.id}
          renderItem={renderGoal}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="target" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Nenhuma meta criada</Text>
              <Text style={styles.emptySubtext}>Crie metas para acompanhar seus objetivos</Text>
            </View>
          }
        />
      )}

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nova Meta</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.modalInput}
            placeholder="Nome da meta"
            placeholderTextColor={colors.textMuted}
            value={form.name}
            onChangeText={v => setForm({ ...form, name: v })}
          />

          <TextInput
            style={styles.modalInput}
            placeholder="Valor alvo (ex: 5000)"
            placeholderTextColor={colors.textMuted}
            value={form.targetAmount}
            onChangeText={v => setForm({ ...form, targetAmount: v })}
            keyboardType="decimal-pad"
          />

          <TextInput
            style={styles.modalInput}
            placeholder="Prazo (YYYY-MM-DD) - opcional"
            placeholderTextColor={colors.textMuted}
            value={form.deadline}
            onChangeText={v => setForm({ ...form, deadline: v })}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleCreate} disabled={saving}>
            {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Criar Meta</Text>}
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
  goalCard: {
    backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  goalIcon: { width: 42, height: 42, borderRadius: borderRadius.sm, justifyContent: 'center', alignItems: 'center' },
  goalInfo: { flex: 1 },
  goalName: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  goalDeadline: { fontSize: fontSize.xs, color: colors.textMuted },
  completedBadge: { backgroundColor: colors.successBg, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.full },
  completedText: { fontSize: fontSize.xs, color: colors.success, fontWeight: '600' },
  depositButton: {
    width: 36, height: 36, borderRadius: borderRadius.full,
    borderWidth: 1.5, borderColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  progressBar: { flex: 1, height: 8, backgroundColor: colors.borderLight, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary, width: 40, textAlign: 'right' },
  goalValues: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs, marginTop: spacing.xs },
  goalCurrent: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  goalTarget: { fontSize: fontSize.sm, color: colors.textMuted },
  depositRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  depositInput: {
    flex: 1, backgroundColor: colors.borderLight, borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md,
  },
  depositConfirm: {
    width: 44, height: 44, borderRadius: borderRadius.sm,
    backgroundColor: colors.success, justifyContent: 'center', alignItems: 'center',
  },
  empty: { alignItems: 'center', paddingTop: 60, gap: spacing.sm },
  emptyText: { fontSize: fontSize.lg, fontWeight: '600', color: colors.textSecondary },
  emptySubtext: { fontSize: fontSize.sm, color: colors.textMuted },
  modalContainer: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: 60 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  modalTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  modalInput: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontSize: fontSize.md, color: colors.text, marginBottom: spacing.md,
  },
  saveButton: {
    backgroundColor: colors.primary, paddingVertical: spacing.md,
    borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.md,
  },
  saveButtonText: { color: '#FFF', fontSize: fontSize.lg, fontWeight: '600' },
});
