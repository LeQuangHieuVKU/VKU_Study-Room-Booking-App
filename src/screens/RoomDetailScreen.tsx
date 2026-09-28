import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useBookingStore } from '../store/useBookingStore';
import { TIME_SLOTS } from '../data/mockRooms';
import { Reservation, TimeSlot } from '../types';
import { QRPassModal } from '../components/QRPassModal';

// Generate 7-day range starting today
const generateNext7Days = () => {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateString = d.toISOString().split('T')[0];
    const isToday = i === 0;

    days.push({
      dateString,
      isToday,
      dayOfWeek: isToday ? 'Today' : dayNames[d.getDay()],
      dayNumber: d.getDate(),
      month: monthNames[d.getMonth()],
    });
  }
  return days;
};

export const RoomDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { roomId } = route.params;

  const rooms = useBookingStore((s) => s.rooms);
  const isSlotBooked = useBookingStore((s) => s.isSlotBooked);
  const createReservation = useBookingStore((s) => s.createReservation);
  const checkInReservation = useBookingStore((s) => s.checkInReservation);

  const room = rooms.find((r) => r.id === roomId);

  const sevenDays = useMemo(() => generateNext7Days(), []);
  const [selectedDate, setSelectedDate] = useState<string>(sevenDays[0].dateString);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // QR Pass Modal state
  const [passModalVisible, setPassModalVisible] = useState<boolean>(false);
  const [generatedPass, setGeneratedPass] = useState<Reservation | null>(null);

  if (!room) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Room not found</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>Return to Rooms</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    const booked = isSlotBooked(room.id, selectedDate, slot.id);
    if (booked) {
      Alert.alert(
        'Slot Unavailable',
        `The slot ${slot.label} on ${selectedDate} has already been booked by another student group. Please select an available slot.`
      );
      return;
    }
    setSelectedSlotId(slot.id);
  };

  const handleBookPress = async () => {
    if (!selectedSlotId) {
      Alert.alert('Selection Required', 'Please choose an available 2-hour time slot.');
      return;
    }

    setIsSubmitting(true);
    const result = await createReservation({
      roomId: room.id,
      date: selectedDate,
      slotId: selectedSlotId,
      groupPurpose: purpose.trim() || 'Collaborative Study Session',
    });
    setIsSubmitting(false);

    if (result.success && result.reservation) {
      setGeneratedPass(result.reservation);
      setPassModalVisible(true);
    } else {
      Alert.alert('Booking Error', result.error || 'Failed to reserve the room.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Photo Header */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: room.image }} style={styles.image} />
          <View style={styles.imageOverlay} />

          <TouchableOpacity
            style={styles.floatingBackBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.imageHeaderInfo}>
            <View style={styles.buildingBadge}>
              <Text style={styles.buildingBadgeText}>
                BUILDING {room.building} • FLOOR {room.floor}
              </Text>
            </View>
            <Text style={styles.imageRoomTitle}>{room.name}</Text>
          </View>
        </View>

        {/* Room Specifications & Equipment */}
        <View style={styles.body}>
          <View style={styles.specCardsRow}>
            <View style={styles.specCard}>
              <Ionicons name="people" size={18} color="#0F52BA" />
              <Text style={styles.specCardLabel}>Capacity</Text>
              <Text style={styles.specCardValue}>{room.capacity} Students</Text>
            </View>

            <View style={styles.specCard}>
              <Ionicons name="location" size={18} color="#0F52BA" />
              <Text style={styles.specCardLabel}>Location</Text>
              <Text style={styles.specCardValue}>Bldg {room.building}-F{room.floor}</Text>
            </View>

            <View style={styles.specCard}>
              <Ionicons name="shield-checkmark" size={18} color="#059669" />
              <Text style={styles.specCardLabel}>Smart Access</Text>
              <Text style={styles.specCardValue}>QR Reader</Text>
            </View>
          </View>

          <Text style={styles.sectionHeading}>About this room</Text>
          <Text style={styles.roomDesc}>{room.description}</Text>
          <Text style={styles.roomLocDetail}>
            <Ionicons name="navigate-circle-outline" size={14} color="#64748B" />{' '}
            {room.locationDetails}
          </Text>

          <Text style={styles.sectionHeading}>Available Equipment</Text>
          <View style={styles.equipmentRow}>
            {room.equipment.map((eq) => (
              <View key={eq} style={styles.equipTag}>
                <Ionicons name="checkmark-circle" size={14} color="#0F52BA" />
                <Text style={styles.equipTagText}>{eq}</Text>
              </View>
            ))}
          </View>

          {/* 7-Day Date Selector */}
          <View style={styles.dateSelectorHeader}>
            <Text style={styles.sectionHeading}>1. Select Date (7 Days)</Text>
            <Text style={styles.dateSelectedLabel}>{selectedDate}</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateScrollContainer}
          >
            {sevenDays.map((d) => {
              const isSelected = selectedDate === d.dateString;
              return (
                <TouchableOpacity
                  key={d.dateString}
                  style={[
                    styles.dateChip,
                    isSelected && styles.dateChipSelected,
                  ]}
                  onPress={() => {
                    setSelectedDate(d.dateString);
                    setSelectedSlotId(null); // Reset slot selection on date change
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dateDayName,
                      isSelected && styles.dateTextSelected,
                    ]}
                  >
                    {d.dayOfWeek}
                  </Text>
                  <Text
                    style={[
                      styles.dateNumber,
                      isSelected && styles.dateTextSelected,
                    ]}
                  >
                    {d.dayNumber}
                  </Text>
                  <Text
                    style={[
                      styles.dateMonth,
                      isSelected && styles.dateTextSelected,
                    ]}
                  >
                    {d.month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 2-Hour Discrete Time Slots & Visual Conflict Engine */}
          <View style={styles.slotHeaderRow}>
            <Text style={styles.sectionHeading}>
              2. Select 2-Hour Time Slot
            </Text>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Available</Text>
              <View style={[styles.legendDot, { backgroundColor: '#CBD5E1', marginLeft: 6 }]} />
              <Text style={styles.legendText}>Booked</Text>
            </View>
          </View>

          <View style={styles.slotsGrid}>
            {TIME_SLOTS.map((slot) => {
              const isBooked = isSlotBooked(room.id, selectedDate, slot.id);
              const isSelected = selectedSlotId === slot.id;

              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.slotCard,
                    isBooked && styles.slotCardBooked,
                    isSelected && styles.slotCardSelected,
                  ]}
                  disabled={isBooked}
                  onPress={() => handleSlotSelect(slot)}
                  activeOpacity={0.8}
                >
                  <View style={styles.slotCardHeader}>
                    <Text
                      style={[
                        styles.slotTimeText,
                        isBooked && styles.slotTimeTextBooked,
                        isSelected && styles.slotTimeTextSelected,
                      ]}
                    >
                      {slot.label}
                    </Text>

                    {isBooked ? (
                      <View style={styles.conflictBadge}>
                        <Ionicons name="lock-closed" size={11} color="#64748B" />
                        <Text style={styles.conflictText}>Booked</Text>
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.availableBadge,
                          isSelected && styles.availableBadgeSelected,
                        ]}
                      >
                        <Ionicons
                          name={isSelected ? 'checkmark-circle' : 'time-outline'}
                          size={12}
                          color={isSelected ? '#0F52BA' : '#059669'}
                        />
                        <Text
                          style={[
                            styles.availableText,
                            isSelected && styles.availableTextSelected,
                          ]}
                        >
                          {isSelected ? 'Selected' : 'Open'}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.slotSubtext,
                      isBooked && styles.slotSubtextBooked,
                      isSelected && styles.slotSubtextSelected,
                    ]}
                  >
                    {isBooked
                      ? 'Slot occupied by another study group'
                      : '2-hour reservation block'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Group / Purpose Form */}
          <Text style={styles.sectionHeading}>3. Study Group Purpose</Text>
          <View style={styles.purposeBox}>
            <TextInput
              style={styles.purposeInput}
              placeholder="e.g. Capstone AI Research, ACM Team Prep, Software Engineering Sprint..."
              placeholderTextColor="#94A3B8"
              value={purpose}
              onChangeText={setPurpose}
              maxLength={100}
            />
          </View>

          {/* Conflict engine safety reminder */}
          <View style={styles.policyNotice}>
            <Ionicons name="information-circle" size={16} color="#0F52BA" />
            <Text style={styles.policyText}>
              Automatic conflict engine guarantees no collisions. A push reminder will trigger 15 minutes before your session begins.
            </Text>
          </View>

          {/* Submit Action */}
          <TouchableOpacity
            style={[
              styles.reserveBtn,
              !selectedSlotId && styles.reserveBtnDisabled,
            ]}
            disabled={!selectedSlotId || isSubmitting}
            onPress={handleBookPress}
            activeOpacity={0.88}
          >
            <Ionicons name="qr-code-outline" size={20} color="#FFFFFF" />
            <Text style={styles.reserveBtnText}>
              {isSubmitting
                ? 'Reserving Room...'
                : selectedSlotId
                ? 'Confirm & Generate Booking Pass'
                : 'Select an Available Slot to Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* QR Code Pass Modal */}
      <QRPassModal
        visible={passModalVisible}
        reservation={generatedPass}
        onClose={() => {
          setPassModalVisible(false);
          navigation.navigate('MyBookingsTab');
        }}
        onCheckIn={(id) => {
          checkInReservation(id);
          if (generatedPass) {
            setGeneratedPass({ ...generatedPass, status: 'checked_in' });
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: '#0F52BA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  floatingBackBtn: {
    position: 'absolute',
    top: 44,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageHeaderInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  buildingBadge: {
    backgroundColor: '#0F52BA',
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  buildingBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  imageRoomTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  body: {
    padding: 16,
  },
  specCardsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  specCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specCardLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
  },
  specCardValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  roomDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 6,
  },
  roomLocDetail: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
  },
  equipmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 22,
  },
  equipTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    gap: 5,
  },
  equipTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
  },
  dateSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateSelectedLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F52BA',
  },
  dateScrollContainer: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 22,
  },
  dateChip: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 64,
  },
  dateChipSelected: {
    backgroundColor: '#0F52BA',
    borderColor: '#0F52BA',
  },
  dateDayName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 2,
  },
  dateMonth: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  dateTextSelected: {
    color: '#FFFFFF',
  },
  slotHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  slotsGrid: {
    gap: 8,
    marginBottom: 20,
  },
  slotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  slotCardBooked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.65,
  },
  slotCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0F52BA',
  },
  slotCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  slotTimeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  slotTimeTextBooked: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  slotTimeTextSelected: {
    color: '#0F52BA',
  },
  conflictBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  conflictText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  availableBadgeSelected: {
    backgroundColor: '#DBEAFE',
  },
  availableText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  availableTextSelected: {
    color: '#1E40AF',
  },
  slotSubtext: {
    fontSize: 12,
    color: '#64748B',
  },
  slotSubtextBooked: {
    color: '#DC2626',
    fontWeight: '500',
  },
  slotSubtextSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  purposeBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  purposeInput: {
    fontSize: 13,
    color: '#0F172A',
  },
  policyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    gap: 8,
  },
  policyText: {
    fontSize: 12,
    color: '#1E40AF',
    flex: 1,
    lineHeight: 16,
  },
  reserveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F52BA',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    shadowColor: '#0F52BA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  reserveBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  reserveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
