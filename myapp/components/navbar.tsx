import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide navbar on these pages
  const hideNavbarRoutes = [
    '/login',
    '/signup',
    '/otp',
  ];

  const shouldHideNavbar = hideNavbarRoutes.some(route => pathname.includes(route));

  if (shouldHideNavbar) {
    return null;
  }

  const navItems = [
    { name: 'Home', icon: 'home', route: '/(tabs)/' },
    { name: 'Transactions', icon: 'list', route: '/(tabs)/transactions' },
    { name: 'Chat', icon: 'chatbubble-ellipses', route: '/chat', isCenter: true },
    { name: 'Statistics', icon: 'stats-chart', route: '/(tabs)/statistics' },
    { name: 'Profile', icon: 'person', route: '/(tabs)/profile' },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item, index) => {
        const isActive = pathname.includes(item.route) || (item.route === '/(tabs)/' && pathname === '/(tabs)');
        
        if (item.isCenter) {
          return (
            <TouchableOpacity
              key={index}
              style={styles.centerButton}
              onPress={() => router.push(item.route as any)}
            >
              <Ionicons name={item.icon as any} size={32} color="#ffffff" />
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            onPress={() => router.push(item.route as any)}
          >
            <Ionicons
              name={isActive ? item.icon : `${item.icon}-outline`}
              size={24}
              color={isActive ? '#2563eb' : '#9ca3af'}
            />
            <Text style={[styles.navText, isActive && styles.navTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  navTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -28,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
