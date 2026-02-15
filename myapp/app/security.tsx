import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Switch, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PageHeader from '@/components/page-header';
import api from '@/lib/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function SecurityScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Change Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete Account Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Login History Modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Sessions Modal
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const response = await api.getSecuritySettings();
      if (response.success && response.data) {
        setBiometricEnabled(response.data.biometricLogin || false);
        setTwoFactorEnabled(response.data.twoFactorAuth || false);
      }
    } catch (error) {
      console.error('Load security settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    setBiometricEnabled(value);
    try {
      await api.updateSecuritySettings({ biometricLogin: value });
    } catch (error) {
      setBiometricEnabled(!value);
      Alert.alert('Error', 'Failed to update biometric setting');
    }
  };

  const handleTwoFactorToggle = async (value: boolean) => {
    setTwoFactorEnabled(value);
    try {
      await api.updateSecuritySettings({ twoFactorAuth: value });
    } catch (error) {
      setTwoFactorEnabled(!value);
      Alert.alert('Error', 'Failed to update two-factor authentication');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await api.changePassword(currentPassword, newPassword);
      if (response.success) {
        Alert.alert('Success', 'Password changed successfully');
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const loadLoginHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await api.getLoginHistory();
      if (response.success && response.data) {
        setLoginHistory(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load login history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const response = await api.getActiveSessions();
      if (response.success && response.data) {
        setSessions(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load sessions');
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const response = await api.revokeSession(sessionId);
      if (response.success) {
        setSessions(sessions.filter(s => s.id !== sessionId));
        Alert.alert('Success', 'Session revoked successfully');
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to revoke session');
    }
  };

  const handleDownloadData = async () => {
    try {
      const response = await api.downloadData();
      if (response.success && response.data) {
        const jsonData = JSON.stringify(response.data, null, 2);
        const fileName = `my-data-${new Date().toISOString().split('T')[0]}.json`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        
        await FileSystem.writeAsStringAsync(fileUri, jsonData);
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Success', `Data saved to ${fileUri}`);
        }
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      console.error('Download data error:', error);
      Alert.alert('Error', 'Failed to download data');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      Alert.alert('Error', 'Please type DELETE to confirm');
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await api.deleteAccount(deletePassword, deleteConfirmation);
      if (response.success) {
        Alert.alert('Account Deleted', 'Your account has been permanently deleted', [
          {
            text: 'OK',
            onPress: async () => {
              await api.logout();
              router.replace('/(auth)/login');
            },
          },
        ]);
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <PageHeader title="Security" showBack={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PageHeader title="Security" showBack={true} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authentication</Text>
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Ionicons name="finger-print" size={20} color="#10b981" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Biometric Login</Text>
                  <Text style={styles.settingDescription}>Use fingerprint or face ID</Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: '#e5e7eb', true: '#86efac' }}
                thumbColor={biometricEnabled ? '#10b981' : '#f3f4f6'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="shield-checkmark" size={20} color="#3b82f6" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
                  <Text style={styles.settingDescription}>Add extra security layer</Text>
                </View>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={handleTwoFactorToggle}
                trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
                thumbColor={twoFactorEnabled ? '#3b82f6' : '#f3f4f6'}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Password</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity 
              style={styles.settingItem} 
              activeOpacity={0.7}
              onPress={() => setShowPasswordModal(true)}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="key" size={20} color="#f59e0b" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Change Password</Text>
                  <Text style={styles.settingDescription}>Update your password</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity 
              style={styles.settingItem} 
              activeOpacity={0.7}
              onPress={() => {
                setShowHistoryModal(true);
                loadLoginHistory();
              }}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#e0e7ff' }]}>
                  <Ionicons name="time" size={20} color="#6366f1" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Login History</Text>
                  <Text style={styles.settingDescription}>View recent login activity</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingItem} 
              activeOpacity={0.7}
              onPress={() => {
                setShowSessionsModal(true);
                loadSessions();
              }}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#fce7f3' }]}>
                  <Ionicons name="phone-portrait" size={20} color="#ec4899" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Active Sessions</Text>
                  <Text style={styles.settingDescription}>Manage logged in devices</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity 
              style={styles.settingItem} 
              activeOpacity={0.7}
              onPress={handleDownloadData}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="download" size={20} color="#3b82f6" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Download Data</Text>
                  <Text style={styles.settingDescription}>Export your account data</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingItem} 
              activeOpacity={0.7}
              onPress={() => setShowDeleteModal(true)}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#fee2e2' }]}>
                  <Ionicons name="trash" size={20} color="#ef4444" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Delete Account</Text>
                  <Text style={styles.settingDescription}>Permanently delete your account</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  placeholder="Enter current password"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="Enter new password"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Confirm new password"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <TouchableOpacity
                style={[styles.modalButton, passwordLoading && styles.modalButtonDisabled]}
                onPress={handleChangePassword}
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalButtonText}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Login History Modal */}
      <Modal
        visible={showHistoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Login History</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {historyLoading ? (
                <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
              ) : loginHistory.length === 0 ? (
                <Text style={styles.emptyText}>No login history available</Text>
              ) : (
                loginHistory.map((item) => (
                  <View key={item.id} style={styles.historyItem}>
                    <View style={styles.historyIcon}>
                      <Ionicons 
                        name={item.success ? "checkmark-circle" : "close-circle"} 
                        size={24} 
                        color={item.success ? "#10b981" : "#ef4444"} 
                      />
                    </View>
                    <View style={styles.historyDetails}>
                      <Text style={styles.historyDevice}>{item.device || 'Unknown Device'}</Text>
                      <Text style={styles.historyInfo}>
                        {item.location || 'Unknown Location'} • {new Date(item.createdAt).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Active Sessions Modal */}
      <Modal
        visible={showSessionsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSessionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Active Sessions</Text>
              <TouchableOpacity onPress={() => setShowSessionsModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {sessionsLoading ? (
                <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
              ) : sessions.length === 0 ? (
                <Text style={styles.emptyText}>No active sessions</Text>
              ) : (
                sessions.map((session) => (
                  <View key={session.id} style={styles.sessionItem}>
                    <View style={styles.sessionIcon}>
                      <Ionicons name="phone-portrait" size={24} color="#3b82f6" />
                    </View>
                    <View style={styles.sessionDetails}>
                      <Text style={styles.sessionDevice}>{session.device || 'Unknown Device'}</Text>
                      <Text style={styles.sessionInfo}>
                        {session.location || 'Unknown'} • {new Date(session.createdAt).toLocaleString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.revokeButton}
                      onPress={() => handleRevokeSession(session.id)}
                    >
                      <Text style={styles.revokeButtonText}>Revoke</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delete Account</Text>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.warningBox}>
                <Ionicons name="warning" size={24} color="#ef4444" />
                <Text style={styles.warningText}>
                  This action cannot be undone. All your data will be permanently deleted.
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={deletePassword}
                  onChangeText={setDeletePassword}
                  secureTextEntry
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Type "DELETE" to confirm</Text>
                <TextInput
                  style={styles.input}
                  value={deleteConfirmation}
                  onChangeText={setDeleteConfirmation}
                  placeholder="DELETE"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton, deleteLoading && styles.modalButtonDisabled]}
                onPress={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalButtonText}>Delete Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  settingsList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  settingDescription: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  bottomSpacing: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  modalButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#991b1b',
    lineHeight: 20,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    marginTop: 20,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
  },
  historyIcon: {
    marginRight: 12,
  },
  historyDetails: {
    flex: 1,
  },
  historyDevice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  historyInfo: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
  },
  sessionIcon: {
    marginRight: 12,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionDevice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  sessionInfo: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  revokeButton: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  revokeButtonText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
});
