import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View style={styles.cardContent}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
        </View>
      </View>
      <Skeleton width="100%" height={12} style={{ marginTop: 12 }} />
    </View>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
}

export function SkeletonBalanceCard() {
  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <Skeleton width={100} height={14} />
        <Skeleton width={24} height={24} borderRadius={12} />
      </View>
      <Skeleton width="70%" height={40} style={{ marginTop: 16, marginBottom: 24 }} />
      <View style={styles.balanceStats}>
        <View style={styles.balanceStat}>
          <Skeleton width={32} height={32} borderRadius={16} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Skeleton width="50%" height={12} />
            <Skeleton width="70%" height={16} style={{ marginTop: 6 }} />
          </View>
        </View>
        <View style={styles.balanceStat}>
          <Skeleton width={32} height={32} borderRadius={16} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Skeleton width="50%" height={12} />
            <Skeleton width="70%" height={16} style={{ marginTop: 6 }} />
          </View>
        </View>
      </View>
    </View>
  );
}

export function SkeletonTransaction() {
  return (
    <View style={styles.transaction}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <View style={styles.transactionContent}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} style={{ marginTop: 6 }} />
      </View>
      <View style={styles.transactionRight}>
        <Skeleton width={80} height={16} />
        <Skeleton width={60} height={12} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

export function SkeletonTransactionList({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonTransaction key={index} />
      ))}
    </View>
  );
}

export function SkeletonStatCard() {
  return (
    <View style={styles.statCard}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <Skeleton width="60%" height={12} style={{ marginTop: 12 }} />
      <Skeleton width="80%" height={20} style={{ marginTop: 8 }} />
    </View>
  );
}

export function SkeletonAccountCard() {
  return (
    <View style={styles.accountCard}>
      <Skeleton width={56} height={56} borderRadius={28} />
      <View style={styles.accountContent}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="50%" height={12} style={{ marginTop: 6 }} />
        <Skeleton width="40%" height={11} style={{ marginTop: 4 }} />
      </View>
      <View style={styles.accountRight}>
        <Skeleton width={80} height={18} />
        <Skeleton width={24} height={20} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

export function SkeletonBudgetCard() {
  return (
    <View style={styles.budgetCard}>
      <View style={styles.budgetHeader}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} style={{ marginTop: 6 }} />
        </View>
        <Skeleton width={60} height={16} />
      </View>
      <Skeleton width="100%" height={8} borderRadius={4} style={{ marginTop: 16 }} />
      <View style={styles.budgetFooter}>
        <Skeleton width="30%" height={12} />
        <Skeleton width="30%" height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e5e7eb',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    marginLeft: 12,
    flex: 1,
  },
  list: {
    paddingHorizontal: 20,
  },
  balanceCard: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginVertical: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  balanceStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  transaction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionContent: {
    marginLeft: 12,
    flex: 1,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  accountContent: {
    marginLeft: 12,
    flex: 1,
  },
  accountRight: {
    alignItems: 'flex-end',
  },
  budgetCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
