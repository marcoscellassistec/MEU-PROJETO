import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
  Alert, Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { api } from '../lib/api';
import { Plan } from '../lib/store';
import { colors, spacing, borderRadius, fontSize } from '../lib/theme';

export default function SubscriptionScreen() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [pixData, setPixData] = useState<{ pixCode: string; amount: number; paymentId: string } | null>(null);

  useEffect(() => {
    api.get<Plan[]>('/subscriptions/plans')
      .then(data => {
        setPlans(data);
        if (data.length > 0) setSelectedPlan(data[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const plan = plans.find(p => p.id === selectedPlan);
  const price = plan ? (isAnnual ? plan.annualPrice : plan.monthlyPrice) : 0;

  const handlePixPayment = async () => {
    setProcessing(true);
    try {
      const data = await api.post<{ pixCode: string; amount: number; paymentId: string }>('/payments/pix', {
        planId: selectedPlan, isAnnual,
      });
      setPixData(data);
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao gerar Pix');
    } finally {
      setProcessing(false);
    }
  };

  const handleMercadoPago = async () => {
    setProcessing(true);
    try {
      const data = await api.post<{ initPoint: string }>('/payments/mercadopago', {
        planId: selectedPlan, isAnnual,
      });
      await Linking.openURL(data.initPoint);
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao processar pagamento');
    } finally {
      setProcessing(false);
    }
  };

  const copyPixCode = async () => {
    if (pixData?.pixCode) {
      await Clipboard.setStringAsync(pixData.pixCode);
      Alert.alert('Copiado!', 'Codigo Pix copiado para a area de transferencia');
    }
  };

  const formatCurrency = (value: number) =>
    `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.heroSection}>
        <View style={styles.heroIcon}>
          <Feather name="zap" size={32} color={colors.primary} />
        </View>
        <Text style={styles.heroTitle}>Seja Premium</Text>
        <Text style={styles.heroSubtitle}>Desbloqueie todas as funcionalidades</Text>
      </View>

      {/* Period Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !isAnnual && styles.toggleButtonActive]}
          onPress={() => setIsAnnual(false)}
        >
          <Text style={[styles.toggleText, !isAnnual && styles.toggleTextActive]}>Mensal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, isAnnual && styles.toggleButtonActive]}
          onPress={() => setIsAnnual(true)}
        >
          <Text style={[styles.toggleText, isAnnual && styles.toggleTextActive]}>Anual</Text>
          {plan && plan.annualDiscount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{plan.annualDiscount}%</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Price */}
      {plan && (
        <View style={styles.priceCard}>
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceCurrency}>R$</Text>
            <Text style={styles.priceValue}>
              {isAnnual
                ? (plan.annualPrice / 12).toFixed(2).replace('.', ',')
                : plan.monthlyPrice.toFixed(2).replace('.', ',')}
            </Text>
            <Text style={styles.priceUnit}>/mes</Text>
          </View>
          {isAnnual && (
            <Text style={styles.annualTotal}>
              {formatCurrency(plan.annualPrice)} cobrado anualmente
            </Text>
          )}
        </View>
      )}

      {/* Features */}
      {plan?.features && (
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>Incluido no Premium</Text>
          {plan.features.map((feature, i) => (
            <View key={i} style={styles.featureRow}>
              <Feather name="check-circle" size={18} color={colors.success} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Pix Result */}
      {pixData && (
        <View style={styles.pixCard}>
          <Text style={styles.pixTitle}>Pix Copia e Cola</Text>
          <Text style={styles.pixAmount}>{formatCurrency(pixData.amount)}</Text>
          <View style={styles.pixCodeContainer}>
            <Text style={styles.pixCode} numberOfLines={3}>{pixData.pixCode}</Text>
          </View>
          <TouchableOpacity style={styles.copyButton} onPress={copyPixCode}>
            <Feather name="copy" size={18} color="#FFF" />
            <Text style={styles.copyButtonText}>Copiar Codigo Pix</Text>
          </TouchableOpacity>
          <Text style={styles.pixNote}>
            Apos o pagamento, sua assinatura sera ativada automaticamente.
          </Text>
        </View>
      )}

      {/* Payment Buttons */}
      {!pixData && (
        <View style={styles.paymentSection}>
          <TouchableOpacity
            style={[styles.paymentButton, styles.pixButton]}
            onPress={handlePixPayment}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Feather name="smartphone" size={20} color="#FFF" />
                <Text style={styles.paymentButtonText}>Pagar com Pix</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentButton, styles.mpButton]}
            onPress={handleMercadoPago}
            disabled={processing}
          >
            <Feather name="credit-card" size={20} color="#FFF" />
            <Text style={styles.paymentButtonText}>Mercado Pago</Text>
          </TouchableOpacity>

          <Text style={styles.secureText}>
            Pagamento seguro e criptografado
          </Text>
        </View>
      )}

      {/* Trial info */}
      <View style={styles.trialInfo}>
        <Feather name="info" size={16} color={colors.info} />
        <Text style={styles.trialInfoText}>
          Voce tem 7 dias gratis ao criar sua conta. Assine a qualquer momento!
        </Text>
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroSection: { alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.lg },
  heroIcon: {
    width: 72, height: 72, borderRadius: borderRadius.xl,
    backgroundColor: colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
  },
  heroTitle: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text },
  heroSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: spacing.xs },
  toggleContainer: {
    flexDirection: 'row', marginHorizontal: spacing.lg, backgroundColor: colors.borderLight,
    borderRadius: borderRadius.md, padding: 4,
  },
  toggleButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.sm, borderRadius: borderRadius.sm, gap: spacing.xs,
  },
  toggleButtonActive: { backgroundColor: colors.card, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  toggleText: { fontSize: fontSize.md, fontWeight: '600', color: colors.textSecondary },
  toggleTextActive: { color: colors.text },
  discountBadge: { backgroundColor: colors.success, paddingHorizontal: 6, paddingVertical: 2, borderRadius: borderRadius.full },
  discountText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  priceCard: {
    alignItems: 'center', marginHorizontal: spacing.lg, marginTop: spacing.lg,
    backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  planName: { fontSize: fontSize.md, fontWeight: '600', color: colors.primary, marginBottom: spacing.xs },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end' },
  priceCurrency: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text, marginBottom: 6 },
  priceValue: { fontSize: 48, fontWeight: '700', color: colors.text, lineHeight: 52 },
  priceUnit: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: 8, marginLeft: 4 },
  annualTotal: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
  featuresCard: {
    marginHorizontal: spacing.lg, marginTop: spacing.md,
    backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md,
  },
  featuresTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.text, marginBottom: spacing.md },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  featureText: { fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 },
  pixCard: {
    marginHorizontal: spacing.lg, marginTop: spacing.lg,
    backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.lg,
    borderWidth: 2, borderColor: colors.success,
  },
  pixTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, textAlign: 'center' },
  pixAmount: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.success, textAlign: 'center', marginTop: spacing.xs },
  pixCodeContainer: {
    backgroundColor: colors.borderLight, borderRadius: borderRadius.sm,
    padding: spacing.md, marginTop: spacing.md,
  },
  pixCode: { fontSize: fontSize.xs, color: colors.text, fontFamily: 'monospace' },
  copyButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.md, marginTop: spacing.md,
  },
  copyButtonText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '600' },
  pixNote: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  paymentSection: { paddingHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.sm },
  paymentButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: spacing.md, borderRadius: borderRadius.md,
  },
  pixButton: { backgroundColor: '#00C9A7' },
  mpButton: { backgroundColor: '#009EE3' },
  paymentButtonText: { color: '#FFF', fontSize: fontSize.lg, fontWeight: '600' },
  secureText: { textAlign: 'center', fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.xs },
  trialInfo: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginHorizontal: spacing.lg, marginTop: spacing.lg,
    backgroundColor: '#E3F2FD', padding: spacing.md, borderRadius: borderRadius.md,
  },
  trialInfoText: { fontSize: fontSize.sm, color: colors.info, flex: 1 },
});
