import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ChatPartyCardProps {
  data: {
    id: string;
    name: string;
    phone: string;
    type: 'receive' | 'give';
    balance: number;
    amount: number; // Transaction amount
  };
}

export default function ChatPartyCard({ data }: ChatPartyCardProps) {
  const router = useRouter();
  const isReceivable = data.type === 'receive';
  const icon = isReceivable ? 'arrow-down-circle' : 'arrow-up-circle';
  const color = isReceivable ? '#10b981' : '#ef4444';
  const bgColor = isReceivable ? '#f0fdf4' : '#fef2f2';
  const typeText = isReceivable ? 'To Receive' : 'To Give';

  const handleViewParty = () => {
    router.push(`/party-details?id=${data.id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{data.name}</Text>
          <Text style={styles.phone}>{data.phone}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color }]}>
            Rs. {Math.abs(data.amount).toLocaleString()}
          </Text>
          <Text style={styles.type}>{typeText}</Text>
        </View>
      </View>

      <View style={styles.balanceRow}>
        <Text style={styles.balanceLabel}>Total Balance:</Text>
        <Text style={[styles.balanceAmount, { color }]}>
          Rs. {Math.abs(data.balance).toLocaleString()}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.viewButton}
        onPress={handleViewParty}
      >
        <Ionicons name="eye-outline" size={18} color="#2563eb" />
        <Text style={styles.viewButtonText}>View Party Details</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  phone: {
    fontSize: 13,
    color: '#6b7280',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  type: {
    fontSize: 12,
    color: '#6b7280',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    gap: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
});
