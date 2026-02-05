import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../lib/store';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Feather name="dollar-sign" size={40} color={colors.primary} />
          </View>
          <Text style={styles.title}>Finanças</Text>
          <Text style={styles.subtitle}>Controle suas finanças pessoais</Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Feather name="mail" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <Link href="/(auth)/register" asChild>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>
                Não tem conta? <Text style={styles.linkBold}>Cadastre-se</Text>
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
  iconContainer: {
    width: 80, height: 80, borderRadius: borderRadius.xl,
    backgroundColor: colors.primaryBg, justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: fontSize.title, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: spacing.xs },
  errorBox: {
    backgroundColor: colors.dangerBg, padding: spacing.md,
    borderRadius: borderRadius.sm, marginBottom: spacing.md,
  },
  errorText: { color: colors.danger, fontSize: fontSize.sm, textAlign: 'center' },
  form: { gap: spacing.md },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, height: 56,
  },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, fontSize: fontSize.md, color: colors.text },
  eyeButton: { padding: spacing.xs },
  button: {
    backgroundColor: colors.primary, height: 56, borderRadius: borderRadius.md,
    justifyContent: 'center', alignItems: 'center', marginTop: spacing.sm,
  },
  buttonText: { color: '#FFF', fontSize: fontSize.lg, fontWeight: '600' },
  linkButton: { alignItems: 'center', paddingVertical: spacing.md },
  linkText: { fontSize: fontSize.md, color: colors.textSecondary },
  linkBold: { color: colors.primary, fontWeight: '600' },
});
