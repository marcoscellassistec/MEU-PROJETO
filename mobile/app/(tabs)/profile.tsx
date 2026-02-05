import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../lib/store';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar' },
      {
        text: 'Sair', style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const subscriptionStatus = () => {
    const sub = user?.subscription;
    if (!sub) return { label: 'Sem plano', color: colors.textMuted, bg: colors.borderLight };
    switch (sub.status) {
      case 'ACTIVE': return { label: 'Premium Ativo', color: colors.success, bg: colors.successBg };
      case 'TRIAL': return { label: 'Trial Gratuito', color: colors.info, bg: '#E3F2FD' };
      case 'EXPIRED': return { label: 'Expirado', color: colors.danger, bg: colors.dangerBg };
      default: return { label: sub.status, color: colors.textMuted, bg: colors.borderLight };
    }
  };

  const status = subscriptionStatus();

  const menuItems = [
    {
      icon: 'star' as const, label: 'Assinatura', subtitle: status.label,
      onPress: () => router.push('/subscription'),
    },
    {
      icon: 'bell' as const, label: 'Notificacoes', subtitle: 'Gerenciar alertas',
      onPress: () => {},
    },
    {
      icon: 'shield' as const, label: 'Privacidade', subtitle: 'Dados e seguranca',
      onPress: () => {},
    },
    {
      icon: 'help-circle' as const, label: 'Ajuda', subtitle: 'Suporte e FAQ',
      onPress: () => {},
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      {/* Subscription CTA */}
      {(!user?.subscription || user.subscription.status === 'TRIAL' || user.subscription.status === 'EXPIRED') && (
        <TouchableOpacity style={styles.ctaCard} onPress={() => router.push('/subscription')}>
          <View style={styles.ctaContent}>
            <Feather name="zap" size={24} color="#FFF" />
            <View style={styles.ctaText}>
              <Text style={styles.ctaTitle}>
                {user?.subscription?.status === 'TRIAL' ? 'Assine agora!' : 'Reative Premium'}
              </Text>
              <Text style={styles.ctaSubtitle}>Acesso completo a todas as funcionalidades</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color="#FFF" />
        </TouchableOpacity>
      )}

      {/* Menu */}
      <View style={styles.menuCard}>
        {menuItems.map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress}>
            <View style={styles.menuIconContainer}>
              <Feather name={item.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Feather name="log-out" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Financas App v1.0.0</Text>
      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md },
  title: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text },
  userCard: {
    alignItems: 'center', backgroundColor: colors.card, marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg, padding: spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm,
  },
  avatarText: { fontSize: fontSize.xxl, fontWeight: '700', color: '#FFF' },
  userName: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  userEmail: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  statusBadge: {
    marginTop: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: { fontSize: fontSize.sm, fontWeight: '600' },
  ctaCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.primary, marginHorizontal: spacing.lg, marginTop: spacing.md,
    borderRadius: borderRadius.lg, padding: spacing.md,
  },
  ctaContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  ctaText: { flex: 1 },
  ctaTitle: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700' },
  ctaSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: fontSize.xs },
  menuCard: {
    backgroundColor: colors.card, marginHorizontal: spacing.lg, marginTop: spacing.md,
    borderRadius: borderRadius.lg, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  menuIconContainer: {
    width: 40, height: 40, borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryBg, justifyContent: 'center', alignItems: 'center',
  },
  menuText: { flex: 1, marginLeft: spacing.sm },
  menuLabel: { fontSize: fontSize.md, fontWeight: '500', color: colors.text },
  menuSubtitle: { fontSize: fontSize.xs, color: colors.textMuted },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    marginHorizontal: spacing.lg, marginTop: spacing.lg,
    paddingVertical: spacing.md, borderRadius: borderRadius.md,
    backgroundColor: colors.dangerBg,
  },
  logoutText: { color: colors.danger, fontSize: fontSize.md, fontWeight: '600' },
  version: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.lg },
});
