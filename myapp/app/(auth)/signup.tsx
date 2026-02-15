import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import api from '@/lib/api';
import Alert from '@/components/alert';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' as any });

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setAlertConfig({
        title: 'Validation Error',
        message: 'Please fill in all fields',
        type: 'error',
      });
      setShowAlert(true);
      return;
    }

    if (password.length < 6) {
      setAlertConfig({
        title: 'Validation Error',
        message: 'Password must be at least 6 characters',
        type: 'error',
      });
      setShowAlert(true);
      return;
    }

    setLoading(true);
    try {
      const response = await api.signup(name, email, password);
      
      if (response.success) {
        setAlertConfig({
          title: 'Success',
          message: response.message,
          type: 'success',
        });
        setShowAlert(true);
        setTimeout(() => {
          router.push({ pathname: '/(auth)/otp', params: { email } });
        }, 1500);
      } else {
        setAlertConfig({
          title: 'Signup Failed',
          message: response.message || 'Failed to create account',
          type: 'error',
        });
        setShowAlert(true);
      }
    } catch (error) {
      setAlertConfig({
        title: 'Error',
        message: 'An error occurred. Please try again.',
        type: 'error',
      });
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Ionicons name="person-add" size={80} color="#2563eb" />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementText}>
                <Ionicons name="checkmark-circle" size={14} color="#10b981" /> At least 8 characters
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.signupButton, loading && styles.signupButtonDisabled]} 
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.signupButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By signing up, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Alert
        visible={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 20,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  eyeIcon: {
    padding: 4,
  },
  passwordRequirements: {
    marginBottom: 24,
  },
  requirementText: {
    color: '#6b7280',
    fontSize: 13,
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  signupButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  termsContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  termsText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  termsLink: {
    color: '#2563eb',
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#6b7280',
    fontSize: 14,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  loginLink: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
});
