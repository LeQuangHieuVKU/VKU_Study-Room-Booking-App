import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useBookingStore } from '../store/useBookingStore';

export const ProfileScreen: React.FC = () => {
  const userSession = useBookingStore((s) => s.userSession);
  const reservations = useBookingStore((s) => s.reservations);
  const resetToMockData = useBookingStore((s) => s.resetToMockData);

  const totalBookings = reservations.length;
  const checkedInCount = reservations.filter((r) => r.status === 'checked_in').length;
  const totalHours = reservations.filter((r) => r.status !== 'cancelled').length * 2;

  const handleTestNotification = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Notification Permission',
          'Please enable notifications in system settings to receive check-in alerts.'
        );
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'VKU Study Room Alert (Test)',
          body: 'Your reserved slot in B.302 AI Lab begins in 15 minutes! Tap to show your QR pass.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
        },
      });

      Alert.alert(
        'Notification Triggered',
        'A test check-in notification was scheduled and will appear in 2 seconds.'
      );
    } catch (err: any) {
      Alert.alert('Notification Notice', err?.message || 'Notification test finished.');
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Demo Data?',
      'This will reset rooms and initial reservations back to default mock state for grading or testing.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetToMockData();
            Alert.alert('Data Reset', 'Default mock rooms and reservations restored.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Student Session</Text>
          <Text style={styles.headerSubtitle}>
            VKU University Student ID & Study Activity
          </Text>
        </View>

        {/* Student ID Card */}
        <View style={styles.studentIdCard}>
          <View style={styles.cardTopRow}>
            <View style={styles.vkuLogo}>
              <Ionicons name="school" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.idCardHeader}>
              <Text style={styles.idCardUniName}>VIETNAM - KOREA UNIVERSITY</Text>
              <Text style={styles.idCardSub}>Campus Smart Access Pass</Text>
            </View>
          </View>

          <View style={styles.idDivider} />

          <View style={styles.studentInfoRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {userSession.name.charAt(0)}
              </Text>
            </View>

            <View style={styles.studentDetails}>
              <Text style={styles.studentName}>{userSession.name}</Text>
              <Text style={styles.studentIdCode}>ID: {userSession.studentId}</Text>
              <Text style={styles.studentDept}>{userSession.department}</Text>
              <Text style={styles.studentYear}>{userSession.year}</Text>
            </View>
          </View>
        </View>

        {/* Reservation Statistics */}
        <Text style={styles.sectionHeading}>Booking Activity Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Ionicons name="calendar" size={22} color="#0F52BA" />
            <Text style={styles.statNumber}>{totalBookings}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="time" size={22} color="#059669" />
            <Text style={styles.statNumber}>{totalHours}h</Text>
            <Text style={styles.statLabel}>Reserved Study</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="checkmark-done-circle" size={22} color="#D97706" />
            <Text style={styles.statNumber}>{checkedInCount}</Text>
            <Text style={styles.statLabel}>Check-ins Done</Text>
          </View>
        </View>

        {/* Utility Actions */}
        <Text style={styles.sectionHeading}>App Diagnostics & Testing</Text>
        <View style={styles.actionCard}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleTestNotification}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="notifications" size={18} color="#0F52BA" />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionRowTitle}>Test Check-in Notification</Text>
              <Text style={styles.actionRowDesc}>
                Fires an immediate 15-minute alert simulation
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleResetData}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="refresh" size={18} color="#EF4444" />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={[styles.actionRowTitle, { color: '#DC2626' }]}>
                Reset to Seed Demo State
              </Text>
              <Text style={styles.actionRowDesc}>
                Restore default mock rooms & reservations
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Campus Rules Notice */}
        <Text style={styles.sectionHeading}>VKU Study Space Guidelines</Text>
        <View style={styles.rulesCard}>
          <View style={styles.ruleItem}>
            <Ionicons name="time-outline" size={16} color="#0F52BA" />
            <Text style={styles.ruleText}>
              <Text style={styles.ruleBold}>15-Minute Grace Period:</Text> Check in with your digital QR pass within 15 minutes of slot start time.
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <Ionicons name="shield-outline" size={16} color="#0F52BA" />
            <Text style={styles.ruleText}>
              <Text style={styles.ruleBold}>Conflict Protection:</Text> Overlapping reservations are blocked at the engine level in real time.
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <Ionicons name="sparkles-outline" size={16} color="#0F52BA" />
            <Text style={styles.ruleText}>
              <Text style={styles.ruleBold}>Clean Space Policy:</Text> Power down projectors and workstations upon leaving.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  studentIdCard: {
    backgroundColor: '#0F52BA',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#0F52BA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 24,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vkuLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  idCardHeader: {
    flex: 1,
  },
  idCardUniName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  idCardSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  idDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 14,
  },
  studentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F52BA',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  studentIdCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FDE047',
    marginTop: 2,
  },
  studentDept: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  studentYear: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 12,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextWrap: {
    flex: 1,
  },
  actionRowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionRowDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 12,
  },
  rulesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ruleText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  ruleBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
});
