import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '@/components/page-header';

export default function HelpSupportScreen() {
  const faqItems = [
    { question: 'How do I add a transaction?', answer: 'Go to the home screen and tap on "Add Income" or "Add Expense" buttons.' },
    { question: 'How do I set a budget?', answer: 'Navigate to the Budget page and tap "Set New Budget" to create category budgets.' },
    { question: 'Can I export my data?', answer: 'Yes, go to Security settings and select "Download Data" to export your information.' },
    { question: 'How do I change my password?', answer: 'Go to Security settings and select "Change Password".' },
  ];

  const contactOptions = [
    { title: 'Email Support', icon: 'mail', value: 'support@financeapp.com', type: 'email' },
    { title: 'Phone Support', icon: 'call', value: '+91 1800 123 4567', type: 'phone' },
    { title: 'WhatsApp', icon: 'logo-whatsapp', value: '+91 98765 43210', type: 'whatsapp' },
    { title: 'Website', icon: 'globe', value: 'www.financeapp.com', type: 'web' },
  ];

  const handleContact = (type: string, value: string) => {
    switch (type) {
      case 'email':
        Linking.openURL(`mailto:${value}`);
        break;
      case 'phone':
        Linking.openURL(`tel:${value}`);
        break;
      case 'whatsapp':
        Linking.openURL(`whatsapp://send?phone=${value}`);
        break;
      case 'web':
        Linking.openURL(`https://${value}`);
        break;
    }
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Help & Support" showBack={true} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqList}>
            {faqItems.map((item, index) => (
              <View key={index} style={styles.faqItem}>
                <View style={styles.faqQuestion}>
                  <Ionicons name="help-circle" size={20} color="#2563eb" />
                  <Text style={styles.faqQuestionText}>{item.question}</Text>
                </View>
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactList}>
            {contactOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactItem}
                onPress={() => handleContact(option.type, option.value)}
                activeOpacity={0.7}
              >
                <View style={styles.contactIcon}>
                  <Ionicons name={option.icon as any} size={20} color="#2563eb" />
                </View>
                <View style={styles.contactText}>
                  <Text style={styles.contactTitle}>{option.title}</Text>
                  <Text style={styles.contactValue}>{option.value}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <View style={styles.resourceList}>
            <TouchableOpacity style={styles.resourceItem} activeOpacity={0.7}>
              <View style={styles.resourceIcon}>
                <Ionicons name="book" size={20} color="#10b981" />
              </View>
              <Text style={styles.resourceText}>User Guide</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.resourceItem} activeOpacity={0.7}>
              <View style={[styles.resourceIcon, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="videocam" size={20} color="#f59e0b" />
              </View>
              <Text style={styles.resourceText}>Video Tutorials</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.resourceItem} activeOpacity={0.7}>
              <View style={[styles.resourceIcon, { backgroundColor: '#dbeafe' }]}>
                <Ionicons name="chatbubbles" size={20} color="#3b82f6" />
              </View>
              <Text style={styles.resourceText}>Community Forum</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
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
  faqList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  faqItem: {
    gap: 8,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  faqQuestionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  faqAnswer: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    paddingLeft: 28,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  contactList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  contactValue: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  resourceList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  bottomSpacing: {
    height: 100,
  },
});
