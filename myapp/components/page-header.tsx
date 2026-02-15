import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  rightIcon?: string;
  onRightPress?: () => void;
}

export default function PageHeader({ 
  title, 
  showBack = false,
  rightIcon,
  onRightPress
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {showBack ? (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        
        <Text style={styles.title}>{title}</Text>
        
        {rightIcon ? (
          <TouchableOpacity 
            style={styles.rightButton}
            onPress={onRightPress}
          >
            <Ionicons name={rightIcon as any} size={24} color="#1f2937" />
          </TouchableOpacity>
        ) : (
          <View style={styles.rightButton} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  rightButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});
