import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { Reservation } from '../types';

interface QRPassModalProps {
  visible: boolean;
  reservation: Reservation | null;
  onClose: () => void;
  onCheckIn: (id: string) => void;
}

export const QRPassModal: React.FC<QRPassModalProps> = ({
  visible,
  reservation,
  onClose,
  onCheckIn,
}) => {
  if (!reservation) return null;

  const isCheckedIn = reservation.status === 'checked_in';
  const isCancelled = reservation.status === 'cancelled';

  const qrDataPayload = JSON.stringify({
    passId: reservation.id,
    roomId: reservation.roomId,
    date: reservation.date,
    slotId: reservation.slotId,
    studentId: reservation.studentId,
    timestamp: reservation.createdAt,
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.universityBadge}>VKU CAMPUS ACCESS</Text>
              <Text style={styles.headerTitle}>Digital Booking Pass</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Status Strip */}
            <View
              style={[
                styles.statusStrip,
                isCheckedIn
                  ? styles.statusStripCheckedIn
                  : isCancelled
                  ? styles.statusStripCancelled
                  : styles.statusStripConfirmed,
              ]}
            >
              <Ionicons
                name={
                  isCheckedIn
                    ? 'checkmark-circle'
                    : isCancelled
                    ? 'close-circle'
                    : 'time'
                }
                size={18}
                color={
                  isCheckedIn
                    ? '#059669'
                    : isCancelled
                    ? '#DC2626'
                    : '#0F52BA'
                }
              />
              <Text
                style={[
                  styles.statusStripText,
                  isCheckedIn
                    ? styles.statusTextCheckedIn
                    : isCancelled
                    ? styles.statusTextCancelled
                    : styles.statusTextConfirmed,
                ]}
              >
                {isCheckedIn
                  ? 'CHECKED-IN • ACCESS GRANTED'
                  : isCancelled
                  ? 'RESERVATION CANCELLED'
                  : 'CONFIRMED • READY FOR SCAN'}
              </Text>
            </View>

            {/* QR Code Container */}
            <View style={styles.qrContainer}>
              <View style={styles.qrFrame}>
                <QRCode
                  value={qrDataPayload}
                  size={190}
                  color={isCancelled ? '#94A3B8' : '#0F172A'}
                  backgroundColor="#FFFFFF"
                />
              </View>
              <Text style={styles.passCode}>{reservation.id}</Text>
              <Text style={styles.scanInstruction}>
                {isCancelled
                  ? 'This pass has been cancelled.'
                  : isCheckedIn
                  ? 'Room door unlocked. Study session active.'
                  : 'Scan at the smart door reader at the room entrance.'}
              </Text>
            </View>

            {/* Ticket Details */}
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Study Room</Text>
                <Text style={styles.detailValueBold}>{reservation.roomName}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.twoColRow}>
                <View style={styles.col}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{reservation.date}</Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.detailLabel}>Time Slot</Text>
                  <Text style={styles.detailValue}>{reservation.timeRange}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.twoColRow}>
                <View style={styles.col}>
                  <Text style={styles.detailLabel}>Student</Text>
                  <Text style={styles.detailValue}>{reservation.studentName}</Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.detailLabel}>Student ID</Text>
                  <Text style={styles.detailValue}>{reservation.studentId}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Study Purpose</Text>
                <Text style={styles.detailValueItalic}>
                  "{reservation.groupPurpose}"
                </Text>
              </View>
            </View>

            {/* Check-In Action Button */}
            {!isCheckedIn && !isCancelled && (
              <TouchableOpacity
                style={styles.checkInActionBtn}
                onPress={() => onCheckIn(reservation.id)}
                activeOpacity={0.85}
              >
                <Ionicons name="scan-outline" size={18} color="#FFFFFF" />
                <Text style={styles.checkInActionBtnText}>
                  Simulate Smart Door Check-in
                </Text>
              </TouchableOpacity>
            )}

            {isCheckedIn && (
              <View style={styles.checkedInNotice}>
                <Ionicons name="checkmark-done" size={20} color="#059669" />
                <Text style={styles.checkedInNoticeText}>
                  You are checked in! Remember to vacate the room before the slot ends.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  universityBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F52BA',
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  statusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  statusStripConfirmed: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  statusStripCheckedIn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusStripCancelled: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statusStripText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusTextConfirmed: {
    color: '#1E40AF',
  },
  statusTextCheckedIn: {
    color: '#065F46',
  },
  statusTextCancelled: {
    color: '#991B1B',
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  qrFrame: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  passCode: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 1.5,
  },
  scanInstruction: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 260,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    marginVertical: 2,
  },
  twoColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  detailValueBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailValueItalic: {
    fontSize: 13,
    color: '#334155',
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  checkInActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F52BA',
    borderRadius: 12,
    width: '100%',
    paddingVertical: 12,
    marginTop: 16,
    gap: 8,
  },
  checkInActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  checkedInNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 8,
    width: '100%',
  },
  checkedInNoticeText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
});
