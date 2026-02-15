import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatSession } from '@/lib/ollama';

interface ChatSidebarProps {
  visible: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAll: () => void;
}

export default function ChatSidebar({
  visible,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAll,
}: ChatSidebarProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sidebar}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="chatbubbles" size={24} color="#2563eb" />
              <Text style={styles.headerTitle}>Chat History</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* New Chat Button */}
          <TouchableOpacity style={styles.newChatButton} onPress={onNewChat}>
            <Ionicons name="add-circle" size={20} color="#ffffff" />
            <Text style={styles.newChatText}>New Chat</Text>
          </TouchableOpacity>

          {/* Sessions List */}
          <ScrollView style={styles.sessionsList} showsVerticalScrollIndicator={false}>
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <View key={session.id} style={styles.sessionItemWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.sessionItem,
                      activeSessionId === session.id && styles.sessionItemActive,
                    ]}
                    onPress={() => {
                      onSelectSession(session.id);
                      onClose();
                    }}
                  >
                    <View style={styles.sessionIcon}>
                      <Ionicons
                        name="chatbubble-ellipses"
                        size={18}
                        color={activeSessionId === session.id ? '#2563eb' : '#6b7280'}
                      />
                    </View>
                    <View style={styles.sessionContent}>
                      <Text
                        style={[
                          styles.sessionTitle,
                          activeSessionId === session.id && styles.sessionTitleActive,
                        ]}
                        numberOfLines={2}
                      >
                        {session.title}
                      </Text>
                      <Text style={styles.sessionDate}>
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDeleteSession(session.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubbles-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>No chat history</Text>
                <Text style={styles.emptySubtext}>Start a new conversation</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          {sessions.length > 0 && (
            <View style={styles.footer}>
              <TouchableOpacity style={styles.clearButton} onPress={onClearAll}>
                <Ionicons name="trash" size={18} color="#ef4444" />
                <Text style={styles.clearButtonText}>Clear All Chats</Text>
              </TouchableOpacity>
            </View>
          )}
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
  sidebar: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
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
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  newChatText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  sessionsList: {
    flex: 1,
    padding: 20,
  },
  sessionItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sessionItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  sessionItemActive: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  sessionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionContent: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  sessionTitleActive: {
    color: '#2563eb',
  },
  sessionDate: {
    fontSize: 11,
    color: '#9ca3af',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fee2e2',
    paddingVertical: 12,
    borderRadius: 12,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
});
