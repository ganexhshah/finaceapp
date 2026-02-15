import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatSession, Message } from './ollama';

const CHAT_SESSIONS_KEY = '@chat_sessions';
const ACTIVE_SESSION_KEY = '@active_session';

class ChatStorageService {
  async getSessions(): Promise<ChatSession[]> {
    try {
      const data = await AsyncStorage.getItem(CHAT_SESSIONS_KEY);
      if (!data) return [];
      const sessions = JSON.parse(data);
      return sessions.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        messages: s.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
      }));
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  }

  async saveSession(session: ChatSession): Promise<void> {
    try {
      const sessions = await this.getSessions();
      const index = sessions.findIndex(s => s.id === session.id);
      
      if (index >= 0) {
        sessions[index] = session;
      } else {
        sessions.unshift(session);
      }

      await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessions = await this.getSessions();
      const filtered = sessions.filter(s => s.id !== sessionId);
      await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }

  async getActiveSessionId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
    } catch (error) {
      console.error('Error getting active session:', error);
      return null;
    }
  }

  async setActiveSessionId(sessionId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
    } catch (error) {
      console.error('Error setting active session:', error);
    }
  }

  async clearAllSessions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CHAT_SESSIONS_KEY);
      await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
    } catch (error) {
      console.error('Error clearing sessions:', error);
    }
  }

  generateSessionTitle(firstMessage: string): string {
    const maxLength = 40;
    const cleaned = firstMessage.trim().replace(/\n/g, ' ');
    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.substring(0, maxLength) + '...';
  }
}

export const chatStorage = new ChatStorageService();
export default chatStorage;
