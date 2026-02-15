import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '@/components/page-header';

export default function NotificationsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [monthlyReports, setMonthlyReports] = useState(true);

  return (
    <View style={styles.container}>
      <PageHeader title="Notifications" showBack={true} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Ionicons name="notifications" size={20} color="#2563eb" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>Receive push notifications</Text>
                </View>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
                thumbColor={pushEnabled ? '#2563eb' : '#f3f4f6'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Ionicons name="mail" size={20} color="#2563eb" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Email Notifications</Text>
                  <Text style={styles.settingDescription}>Receive email updates</Text>
                </View>
              </View>
              <Switch
                value={emailEnabled}
                onValueChange={setEmailEnabled}
                trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
                thumbColor={emailEnabled ? '#2563eb' : '#f3f4f6'}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alerts</Text>
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="wallet" size={20} color="#f59e0b" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Budget Alerts</Text>
                  <Text style={styles.settingDescription}>Alert when approaching budget limit</Text>
                </View>
              </View>
              <Switch
                value={budgetAlerts}
                onValueChange={setBudgetAlerts}
                trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
                thumbColor={budgetAlerts ? '#2563eb' : '#f3f4f6'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="swap-horizontal" size={20} color="#3b82f6" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Transaction Alerts</Text>
                  <Text style={styles.settingDescription}>Notify on new transactions</Text>
                </View>
              </View>
              <Switch
                value={transactionAlerts}
                onValueChange={setTransactionAlerts}
                trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
                thumbColor={transactionAlerts ? '#2563eb' : '#f3f4f6'}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reports</Text>
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#d1fae5' }]}>
                  <Ionicons name="bar-chart" size={20} color="#10b981" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Weekly Reports</Text>
                  <Text style={styles.settingDescription}>Receive weekly spending summary</Text>
                </View>
              </View>
              <Switch
                value={weeklyReports}
                onValueChange={setWeeklyReports}
                trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
                thumbColor={weeklyReports ? '#2563eb' : '#f3f4f6'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#e0e7ff' }]}>
                  <Ionicons name="stats-chart" size={20} color="#6366f1" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Monthly Reports</Text>
                  <Text style={styles.settingDescription}>Receive monthly financial report</Text>
                </View>
              </View>
              <Switch
                value={monthlyReports}
                onValueChange={setMonthlyReports}
                trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
                thumbColor={monthlyReports ? '#2563eb' : '#f3f4f6'}
              />
            </View>
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
    backgroundColor: '#eff6ff',
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
});
