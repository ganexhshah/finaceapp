import React, { useState, useRef } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '@/lib/api';
import Alert from '@/components/alert';

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string || 'example@email.com';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' as any });
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value.charAt(value.length - 1);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setAlertConfig({
        title: 'Validation Error',
        message: 'Please enter all 6 digits',
        type: 'error',
      });
      setShowAlert(true);
      return;
    }

    setLoading(true);
    try {
      const response = await api.verifyOTP(email, otpCode);
      
      if (response.success) {
        setAlertConfig({
          title: 'Success',
          message: 'Email verified successfully!',
          type: 'success',
        });
        setShowAlert(true);
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 1500);
      } else {
        setAlertConfig({
          title: 'Verification Failed',
          message: response.message || 'Invalid or expired OTP',
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

  const handleResend = async () => {
    setResending(true);
    try {
      const response = await api.resendOTP(email);
      
      if (response.success) {
        setAlertConfig({
          title: 'Success',
          message: 'OTP sent successfully!',
          type: 'success',
        });
        setShowAlert(true);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setAlertConfig({
          title: 'Failed',
          message: response.message || 'Failed to resend OTP',
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
      setResending(false);
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
            <View style={styles.iconContainer}>
              <Ionicons name="mail-open" size={80} color="#2563eb" />
            </View>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a verification code to{'\n'}
              <Text style={styles.email}>{email}</Text>
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Enter Verification Code</Text>
            
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.otpInput,
                    digit ? styles.otpInputFilled : null,
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  editable={!loading}
                />
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.verifyButton, loading && styles.verifyButtonDisabled]} 
              onPress={handleVerify}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify</Text>
              )}
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                {resending ? (
                  <ActivityIndicator size="small" color="#2563eb" />
                ) : (
                  <Text style={styles.resendLink}>Resend</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="#2563eb" />
              <Text style={styles.backButtonText}>Back to Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Ionicons name="shield-checkmark" size={24} color="#10b981" />
            <Text style={styles.footerText}>
              Your information is secure and encrypted
            </Text>
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
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  email: {
    color: '#2563eb',
    fontWeight: '600',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 60,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  otpInputFilled: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  verifyButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    color: '#6b7280',
    fontSize: 14,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  resendLink: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  backButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 8,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 13,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
});
