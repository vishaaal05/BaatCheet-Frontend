import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { connectSocket } from '../socket/socket';
import { loginService } from '../services/auth.service';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore(s => s.setAuth);

  const login = async () => {
    console.log('LOGIN BUTTON PRESSED');

    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await loginService({ email, password });
      console.log('Login successful:', result);
      setAuth(result.token, result.user.id);
      connectSocket(result.token, result.user.id);
      navigation.replace('Conversations');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.bgAccentTop} />
      <View style={styles.bgAccentBottom} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.kicker}>BaatCheet</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in to pick up your conversations.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              placeholderTextColor="#7a7a7a"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              placeholderTextColor="#7a7a7a"
              secureTextEntry
              style={styles.input}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            onPress={login}
            activeOpacity={0.85}
            style={styles.cta}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#111" />
            ) : (
              <Text style={styles.ctaText}>Login</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerHint}>
            Chat securely with a clean, fast experience.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0c0b10',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  bgAccentTop: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#2a2cf4',
    opacity: 0.18,
    top: -80,
    right: -60,
  },
  bgAccentBottom: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: '#f86b3a',
    opacity: 0.14,
    bottom: -120,
    left: -80,
  },
  card: {
    width: '100%',
    borderRadius: 28,
    padding: 24,
    backgroundColor: '#14131a',
    borderWidth: 1,
    borderColor: '#23212c',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  kicker: {
    color: '#f3a63b',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.select({
      ios: 'AvenirNext-DemiBold',
      android: 'sans-serif-condensed',
    }),
  },
  title: {
    color: '#f7f2ff',
    fontSize: 28,
    marginTop: 6,
    fontWeight: '700',
    fontFamily: Platform.select({
      ios: 'AvenirNext-Bold',
      android: 'sans-serif-condensed',
    }),
  },
  subtitle: {
    color: '#b8b3c8',
    marginTop: 6,
    marginBottom: 18,
    fontSize: 14,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    color: '#c7c3d6',
    fontSize: 12,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#0f0e14',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#262334',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f5f2ff',
    fontSize: 15,
  },
  error: {
    color: '#ff8067',
    marginTop: 4,
    marginBottom: 12,
  },
  cta: {
    backgroundColor: '#f3a63b',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  ctaText: {
    color: '#1b1304',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  footerHint: {
    color: '#8c889a',
    textAlign: 'center',
    marginTop: 18,
    fontSize: 12,
  },
});
