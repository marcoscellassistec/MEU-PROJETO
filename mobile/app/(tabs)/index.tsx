import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore, Summary, Bill } from '../../lib/store';
import { api } from '../../lib/api';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [upcomingBills, setUpcomingBills] = useState<Bill[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [summaryData, billsData] = await Promise.all([
        api.get<Summary>('/transactions/summary'),
        api.get<Bill[]>('/bills/upcoming'),
      ]);
      setSummary(summaryData);
      setUpcomingBills(billsData);
    } catch (err) {
      console.error('Load dashboard error:', err);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (value: number) =>
    `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Ola, {user?.name?.split(' ')[0]}!</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/subscription')} style={styles.premiumButton}>
          <Feather name="star" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo do Mes</Text>
        <Text style={[styles.balanceValue, { color: (summary?.balance ?? 0) >= 0 ? '#FFF' : '#FFB3B3' }]}>
          {formatCurrency(summary?.balance ?? 0)}
        </Text>
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <View style={[styles.balanceDot, { backgroundColor: '#81C784' }]} />
            <View>
              <Text style={styles.balanceItemLabel}>Entradas</Text>
              <Text style={styles.balanceItemValue}>{formatCurrency(summary?.income ?? 0)}</Text>
            </View>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceItem}>
            <View style={[styles.balanceDot, { backgroundColor: '#EF9A9A' }]} />
            <View>
              <Text style={styles.balanceItemLabel}>Saidas</Text>
              <Text style={styles.balanceItemValue}>{formatCurrency(summary?.expense ?? 0)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/transactions')}>
          <View style={[styles.actionIcon, { backgroundColor: colors.successBg }]}>
            <Feather name="plus-circle" size={22} color={colors.success} />
          </View>
          <Text style={styles.actionLabel}>Adicionar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/goals')}>
          <View style={[styles.actionIcon, { backgroundColor: colors.primaryBg }]}>
            <Feather name="target" size={22} color={colors.primary} />
          </View>
          <Text style={styles.actionLabel}>Metas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/bills')}>
          <View style={[styles.actionIcon, { backgroundColor: colors.warningBg }]}>
            <Feather name="calendar" size={22} color={colors.warning} />
          </View>
          <Text style={styles.actionLabel}>Contas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/transactions')}>
          <View style={[styles.actionIcon, { backgroundColor: colors.dangerBg }]}>
            <Feather name="bar-chart-2" size={22} color={colors.danger} />
          </View>
          <Text style={styles.actionLabel}>Graficos</Text>
        </TouchableOpacity>
      </View>

      {/* Expenses by Category */}
      {summary?.byCategory && summary.byCategory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gastos por Categoria</Text>
          <View style={styles.card}>
            {summary.byCategory.slice(0, 5).map((cat, i) => {
              const maxTotal = Math.max(...summary.byCategory.map(c => c.total));
              const percentage = maxTotal > 0 ? (cat.total / maxTotal) * 100 : 0;
              return (
                <View key={i} style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                    <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                    <Text style={styles.categoryName}>{cat.name}</Text>
                  </View>
                  <View style={styles.categoryBarContainer}>
                    <View style={[styles.categoryBar, { width: `${percentage}%`, backgroundColor: cat.color }]} />
                  </View>
                  <Text style={styles.categoryValue}>{formatCurrency(cat.total)}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Upcoming Bills */}
      {upcomingBills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contas Proximas</Text>
          <View style={styles.card}>
            {upcomingBills.slice(0, 3).map(bill => (
              <View key={bill.id} style={styles.billRow}>
                <View style={[styles.billIcon, { backgroundColor: colors.warningBg }]}>
                  <Feather name="alert-circle" size={18} color={colors.warning} />
                </View>
                <View style={styles.billInfo}>
                  <Text style={styles.billName}>{bill.name}</Text>
                  <Text style={styles.billDate}>
                    Vence em {new Date(bill.dueDate).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <Text style={styles.billAmount}>{formatCurrency(bill.amount)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md,
  },
  greeting: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  date: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  premiumButton: {
    width: 44, height: 44, borderRadius: borderRadius.full,
    backgroundColor: colors.primaryBg, justifyContent: 'center', alignItems: 'center',
  },
  balanceCard: {
    marginHorizontal: spacing.lg, marginTop: spacing.md,
    backgroundColor: colors.primary, borderRadius: borderRadius.lg,
    padding: spacing.lg, paddingVertical: spacing.xl,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: fontSize.sm },
  balanceValue: { fontSize: 36, fontWeight: '700', color: '#FFF', marginTop: spacing.xs },
  balanceRow: {
    flexDirection: 'row', marginTop: spacing.lg, alignItems: 'center',
  },
  balanceItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  balanceDot: { width: 10, height: 10, borderRadius: 5 },
  balanceItemLabel: { color: 'rgba(255,255,255,0.7)', fontSize: fontSize.xs },
  balanceItemValue: { color: '#FFF', fontSize: fontSize.md, fontWeight: '600' },
  balanceDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },
  actionsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginHorizontal: spacing.lg, marginTop: spacing.lg,
  },
  actionButton: { alignItems: 'center', gap: spacing.xs },
  actionIcon: {
    width: 52, height: 52, borderRadius: borderRadius.md,
    justifyContent: 'center', alignItems: 'center',
  },
  actionLabel: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: '500' },
  section: { marginTop: spacing.lg, paddingHorizontal: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.card, borderRadius: borderRadius.lg,
    padding: spacing.md, gap: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  categoryInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, width: 100 },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  categoryName: { fontSize: fontSize.sm, color: colors.text, fontWeight: '500' },
  categoryBarContainer: {
    flex: 1, height: 8, backgroundColor: colors.borderLight, borderRadius: 4, overflow: 'hidden',
  },
  categoryBar: { height: '100%', borderRadius: 4 },
  categoryValue: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, width: 80, textAlign: 'right' },
  billRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  billIcon: { width: 40, height: 40, borderRadius: borderRadius.sm, justifyContent: 'center', alignItems: 'center' },
  billInfo: { flex: 1 },
  billName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  billDate: { fontSize: fontSize.xs, color: colors.textMuted },
  billAmount: { fontSize: fontSize.md, fontWeight: '700', color: colors.expense },
});
