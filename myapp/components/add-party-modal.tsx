import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CURRENCY_SYMBOL } from '@/constants/currency';
import api from '@/lib/api';
import Alert from '@/components/alert';
import { resolveDateOptionToISO } from '@/lib/dates';

interface AddPartyModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function AddPartyModal({ visible, onClose, onSaved }: AddPartyModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [creditType, setCreditType] = useState<'receive' | 'give'>('receive');
  const [openingBalance, setOpeningBalance] = useState('');
  const [asOfDate, setAsOfDate] = useState('Today');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' as any });

  const dateOptions = ['Today', 'Yesterday', '1 week ago', '1 month ago', 'Custom'];

  const handleDateSelect = (selectedDate: string) => {
    setAsOfDate(selectedDate);
    setShowDatePicker(false);
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setCreditType('receive');
    setOpeningBalance('');
    setAsOfDate('Today');
    setEmail('');
    setAddress('');
    setPanNumber('');
    setShowAdditional(false);
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      setAlertConfig({ title: 'Validation Error', message: 'Name and phone are required', type: 'error' });
      setShowAlert(true);
      return;
    }

    const opening = openingBalance ? Number(openingBalance) : 0;
    if (Number.isNaN(opening)) {
      setAlertConfig({ title: 'Validation Error', message: 'Opening balance must be a number', type: 'error' });
      setShowAlert(true);
      return;
    }

    setSaving(true);
    try {
      const response = await api.createParty({
        name: name.trim(),
        phone: phone.trim(),
        type: creditType,
        openingBalance: opening,
        balance: opening,
        asOfDate: resolveDateOptionToISO(asOfDate),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        panNumber: panNumber.trim() || undefined,
      });

      if (!response.success) {
        setAlertConfig({ title: 'Failed', message: response.message || 'Failed to create party', type: 'error' });
        setShowAlert(true);
        return;
      }

      // Show success alert
      setAlertConfig({ title: 'Success', message: 'Party added successfully', type: 'success' });
      setShowAlert(true);
      
      // Wait a bit before closing to show the success message
      setTimeout(() => {
        resetForm();
        onSaved?.();
        onClose();
      }, 1500);
    } catch (e) {
      setAlertConfig({ title: 'Error', message: 'Something went wrong while saving party', type: 'error' });
      setShowAlert(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add New Party</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Profile Setup */}
            <View style={styles.avatarSection}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={32} color="#2563eb" />
              </View>
              <TouchableOpacity style={styles.uploadButton}>
                <Ionicons name="camera" size={16} color="#2563eb" />
                <Text style={styles.uploadText}>Upload Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter party name"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone number"
                  placeholderTextColor="#9ca3af"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Credit Info */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Credit Info</Text>
              <View style={styles.creditOptions}>
                <TouchableOpacity
                  style={[
                    styles.creditOption,
                    creditType === 'receive' && styles.creditOptionActive,
                    { borderColor: creditType === 'receive' ? '#10b981' : '#e5e7eb' }
                  ]}
                  onPress={() => setCreditType('receive')}
                >
                  <Ionicons 
                    name="arrow-down-circle" 
                    size={24} 
                    color={creditType === 'receive' ? '#10b981' : '#6b7280'} 
                  />
                  <Text style={[
                    styles.creditOptionText,
                    creditType === 'receive' && { color: '#10b981' }
                  ]}>
                    To Receive
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.creditOption,
                    creditType === 'give' && styles.creditOptionActive,
                    { borderColor: creditType === 'give' ? '#ef4444' : '#e5e7eb' }
                  ]}
                  onPress={() => setCreditType('give')}
                >
                  <Ionicons 
                    name="arrow-up-circle" 
                    size={24} 
                    color={creditType === 'give' ? '#ef4444' : '#6b7280'} 
                  />
                  <Text style={[
                    styles.creditOptionText,
                    creditType === 'give' && { color: '#ef4444' }
                  ]}>
                    To Give
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Opening Balance */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Opening Balance</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencyPrefix}>{CURRENCY_SYMBOL}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  value={openingBalance}
                  onChangeText={setOpeningBalance}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* As of Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>As of Date</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                <Text style={styles.dateText}>{asOfDate}</Text>
                <Ionicons name="chevron-down" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Additional Details Toggle */}
            <TouchableOpacity
              style={styles.additionalToggle}
              onPress={() => setShowAdditional(!showAdditional)}
            >
              <Text style={styles.additionalToggleText}>Additional Details (Optional)</Text>
              <Ionicons 
                name={showAdditional ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color="#2563eb" 
              />
            </TouchableOpacity>

            {/* Additional Details */}
            {showAdditional && (
              <View style={styles.additionalSection}>
                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter email address"
                      placeholderTextColor="#9ca3af"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Address */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Address</Text>
                  <View style={[styles.inputContainer, styles.textAreaContainer]}>
                    <Ionicons name="location-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Enter address"
                      placeholderTextColor="#9ca3af"
                      value={address}
                      onChangeText={setAddress}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>

                {/* PAN Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>PAN Number</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="card-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter PAN number"
                      placeholderTextColor="#9ca3af"
                      value={panNumber}
                      onChangeText={setPanNumber}
                      autoCapitalize="characters"
                      maxLength={10}
                    />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Party</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity 
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.dateList}>
              {dateOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateOption,
                    asOfDate === option && styles.dateOptionActive
                  ]}
                  onPress={() => handleDateSelect(option)}
                >
                  <Text style={[
                    styles.dateOptionText,
                    asOfDate === option && styles.dateOptionTextActive
                  ]}>
                    {option}
                  </Text>
                  {asOfDate === option && (
                    <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Alert
        visible={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  form: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
  },
  uploadText: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginRight: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  creditOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  creditOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 16,
  },
  creditOptionActive: {
    backgroundColor: '#ffffff',
  },
  creditOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  additionalToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  additionalToggleText: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  additionalSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  textAreaContainer: {
    height: 'auto',
    minHeight: 80,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 60,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  saveButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  dateList: {
    padding: 12,
  },
  dateOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  dateOptionActive: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  dateOptionText: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  dateOptionTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
});
