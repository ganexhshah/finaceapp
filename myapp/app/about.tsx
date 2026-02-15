import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '@/components/page-header';

export default function AboutScreen() {
  const appInfo = [
    { label: 'Version', value: '1.0.0' },
    { label: 'Build', value: '2026.02.001' },
    { label: 'Last Updated', value: 'February 14, 2026' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: 'logo-facebook', url: 'https://facebook.com', color: '#1877f2' },
    { name: 'Twitter', icon: 'logo-twitter', url: 'https://twitter.com', color: '#1da1f2' },
    { name: 'Instagram', icon: 'logo-instagram', url: 'https://instagram.com', color: '#e4405f' },
    { name: 'LinkedIn', icon: 'logo-linkedin', url: 'https://linkedin.com', color: '#0a66c2' },
  ];

  const legalLinks = [
    { title: 'Terms of Service', icon: 'document-text-outline' },
    { title: 'Privacy Policy', icon: 'shield-checkmark-outline' },
    { title: 'Licenses', icon: 'key-outline' },
  ];

  return (
    <View style={styles.container}>
      <PageHeader title="About" showBack={true} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.appHeader}>
          <View style={styles.appIcon}>
            <Ionicons name="wallet" size={48} color="#2563eb" />
          </View>
          <Text style={styles.appName}>Finance Tracker</Text>
          <Text style={styles.appTagline}>Manage your money with ease</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoList}>
            {appInfo.map((item, index) => (
              <View key={index} style={styles.infoItem}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Us</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              Finance Tracker is your personal finance management app designed to help you track income, expenses, and budgets effortlessly. Our mission is to make financial management simple and accessible for everyone.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow Us</Text>
          <View style={styles.socialContainer}>
            {socialLinks.map((social, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.socialButton, { backgroundColor: `${social.color}20` }]}
                onPress={() => Linking.openURL(social.url)}
                activeOpacity={0.7}
              >
                <Ionicons name={social.icon as any} size={24} color={social.color} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.legalList}>
            {legalLinks.map((link, index) => (
              <TouchableOpacity key={index} style={styles.legalItem} activeOpacity={0.7}>
                <View style={styles.legalIcon}>
                  <Ionicons name={link.icon as any} size={20} color="#2563eb" />
                </View>
                <Text style={styles.legalText}>{link.title}</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ in India</Text>
          <Text style={styles.copyright}>© 2026 Finance Tracker. All rights reserved.</Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
  },
  appHeader: {
    backgroundColor: '#ffffff',
    paddingVertical: 40,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eff6ff',
    borderWidth: 3,
    borderColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  appTagline: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
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
  infoList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 15,
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  aboutCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aboutText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  legalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  legalText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  copyright: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  bottomSpacing: {
    height: 100,
  },
});
