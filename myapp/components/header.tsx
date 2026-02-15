import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/lib/api';

interface HeaderProps {
  userName?: string;
  userImage?: string;
}

export default function Header({ 
  userName,
  userImage 
}: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  // Add a way to force refresh when component mounts
  useEffect(() => {
    // Clear old cache on mount to ensure fresh data
    const clearOldCache = async () => {
      try {
        await AsyncStorage.removeItem('user');
      } catch (e) {
        console.error('Error clearing cache:', e);
      }
    };
    clearOldCache();
  }, []);

  const loadUserData = async () => {
    try {
      // Fetch fresh data from API first
      const response = await api.getProfile();
      console.log('Profile API response:', response); // Debug log
      
      if (response.success && response.data) {
        // Data is directly in response.data (not nested)
        const userInfo = response.data;
        console.log('User info:', userInfo); // Debug log
        setUser(userInfo);
        // Update AsyncStorage with fresh data
        await AsyncStorage.setItem('user', JSON.stringify(userInfo));
        setLoading(false);
        return;
      }

      // Fallback to AsyncStorage if API fails
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('Stored user:', parsedUser); // Debug log
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Try AsyncStorage as fallback
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (e) {
        console.error('Error loading from storage:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  // Use props if provided, otherwise use fetched user data
  const displayName = userName || user?.name || 'User';
  const displayImage = userImage || user?.avatar;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <TouchableOpacity style={styles.profileImageContainer}>
            {loading ? (
              <View style={styles.profileImagePlaceholder}>
                <ActivityIndicator size="small" color="#2563eb" />
              </View>
            ) : displayImage ? (
              <Image source={{ uri: displayImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={24} color="#2563eb" />
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Hi, {displayName}</Text>
            <Text style={styles.subGreeting}>Welcome back!</Text>
          </View>
        </View>
        
        <View style={styles.rightSection}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/search')}
            activeOpacity={0.7}
          >
            <Ionicons name="search-outline" size={24} color="#1f2937" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={24} color="#1f2937" />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  profileImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  subGreeting: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '400',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
});
