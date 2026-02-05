import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../lib/store';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Preencha todos os campos');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Comece com 7 dias gratis!</Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Feather name="user" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Nome completo" placeholderTextColor={colors.textMuted}
              value={name} onChangeText={setName} autoCapitalize="words" />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="mail" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.textMuted}
              value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Senha" placeholderTextColor={colors.textMuted}
              value={password} onChangeText={setPassword} secureTextEntry />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Confirmar senha" placeholderTextColor={colors.textMuted}
              value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Criar Conta</Text>}
          </TouchableOpacity>

          <View style={styles.trialBadge}>
            <Feather name="gift" size={16} color={colors.primary} />
            <Text style={styles.trialText}>7 dias gratis - sem compromisso</Text>
          </View>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>
                Ja tem conta? <Text style={styles.linkBold}>Entrar</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  title: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: spacing.xs },
  errorBox: { backgroundColor: colors.dangerBg, padding: spacing.md, borderRadius: borderRadius.sm, marginBottom: spacing.md },
  errorText: { color: colors.danger, fontSize: fontSize.sm, textAlign: 'center' },
  form: { gap: spacing.md },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, height: 56,
  },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, fontSize: fontSize.md, color: colors.text },
  button: {
    backgroundColor: colors.primary, height: 56, borderRadius: borderRadius.md,
    justifyContent: 'center', alignItems: 'center', marginTop: spacing.sm,
  },
  buttonText: { color: '#FFF', fontSize: fontSize.lg, fontWeight: '600' },
  trialBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.xs, paddingVertical: spacing.sm,
  },
  trialText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '500' },
  linkButton: { alignItems: 'center', paddingVertical: spacing.sm },
  linkText: { fontSize: fontSize.md, color: colors.textSecondary },
  linkBold: { color: colors.primary, fontWeight: '600' },
});
