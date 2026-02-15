import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ollamaService from '@/lib/ollama';

interface ChatSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export default function ChatSettingsModal({
  visible,
  onClose,
  selectedModel,
  onModelChange,
}: ChatSettingsModalProps) {
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [streamEnabled, setStreamEnabled] = useState(true);

  useEffect(() => {
    if (visible) {
      loadModels();
    }
  }, [visible]);

  const loadModels = async () => {
    setLoading(true);
    const isConnected = await ollamaService.checkConnection();
    setConnected(isConnected);

    if (isConnected) {
      const availableModels = await ollamaService.listModels();
      setModels(availableModels);
    }
    setLoading(false);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="settings" size={24} color="#2563eb" />
              <Text style={styles.headerTitle}>Chat Settings</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Connection Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ollama Connection</Text>
              <View style={styles.statusCard}>
                <View style={styles.statusLeft}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: connected ? '#10b981' : '#ef4444' },
                    ]}
                  />
                  <View>
                    <Text style={styles.statusText}>
                      {connected ? 'Connected' : 'Disconnected'}
                    </Text>
                    <Text style={styles.statusSubtext}>
                      {connected
                        ? 'Ollama is running on localhost:11434'
                        : 'Please start Ollama server'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.refreshButton} onPress={loadModels}>
                  <Ionicons name="refresh" size={20} color="#2563eb" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Model Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI Model</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#2563eb" />
                  <Text style={styles.loadingText}>Loading models...</Text>
                </View>
              ) : models.length > 0 ? (
                <View style={styles.modelsList}>
                  {models.map((model) => (
                    <TouchableOpacity
                      key={model}
                      style={[
                        styles.modelItem,
                        selectedModel === model && styles.modelItemActive,
                      ]}
                      onPress={() => onModelChange(model)}
                    >
                      <View style={styles.modelLeft}>
                        <Ionicons
                          name="cube"
                          size={20}
                          color={selectedModel === model ? '#2563eb' : '#6b7280'}
                        />
                        <Text
                          style={[
                            styles.modelName,
                            selectedModel === model && styles.modelNameActive,
                          ]}
                        >
                          {model}
                        </Text>
                      </View>
                      {selectedModel === model && (
                        <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="cube-outline" size={48} color="#d1d5db" />
                  <Text style={styles.emptyText}>No models found</Text>
                  <Text style={styles.emptySubtext}>
                    Install models using: ollama pull llama2
                  </Text>
                </View>
              )}
            </View>

            {/* Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="flash" size={20} color="#6b7280" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Stream Responses</Text>
                    <Text style={styles.settingDescription}>
                      Show responses as they're generated
                    </Text>
                  </View>
                </View>
                <Switch
                  value={streamEnabled}
                  onValueChange={setStreamEnabled}
                  trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                  thumbColor={streamEnabled ? '#2563eb' : '#f3f4f6'}
                />
              </View>
            </View>

            {/* Info */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color="#2563eb" />
              <Text style={styles.infoText}>
                This app uses Ollama to run AI models locally on your device. Make sure
                Ollama is installed and running.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  statusSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  modelsList: {
    gap: 8,
  },
  modelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modelItemActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  modelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modelName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  modelNameActive: {
    color: '#2563eb',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  settingDescription: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#2563eb',
    lineHeight: 18,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
});
