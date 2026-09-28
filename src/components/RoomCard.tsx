import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../types';

interface RoomCardProps {
  room: Room;
  isAvailableNow: boolean;
  onPress: (room: Room) => void;
}

const getEquipmentIcon = (name: string): keyof typeof Ionicons.glyphMap => {
  switch (name) {
    case 'Projector':
      return 'videocam-outline';
    case 'Whiteboard':
      return 'create-outline';
    case 'High-spec PC':
      return 'desktop-outline';
    case 'AC':
      return 'snow-outline';
    default:
      return 'hardware-chip-outline';
  }
};

export const RoomCard: React.FC<RoomCardProps> = React.memo(
  ({ room, isAvailableNow, onPress }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() => onPress(room)}
        accessibilityRole="button"
        accessibilityLabel={`${room.name}, Building ${room.building}, Floor ${room.floor}, ${isAvailableNow ? 'Available Now' : 'Currently Occupied'}`}
      >
        {/* Room Preview Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: room.image }}
            style={styles.image}
            resizeMode="cover"
          />
          {/* Real-time Status Badge */}
          <View
            style={[
              styles.statusBadge,
              isAvailableNow ? styles.statusAvailable : styles.statusOccupied,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isAvailableNow ? styles.dotAvailable : styles.dotOccupied,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                isAvailableNow ? styles.textAvailable : styles.textOccupied,
              ]}
            >
              {isAvailableNow ? 'Available Now' : 'Occupied'}
            </Text>
          </View>

          {/* Building & Floor Tag */}
          <View style={styles.buildingTag}>
            <Ionicons name="business" size={13} color="#FFFFFF" />
            <Text style={styles.buildingTagText}>
              Bldg {room.building} • Fl {room.floor}
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {room.name}
            </Text>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {room.description}
          </Text>

          {/* Specs & Equipment Badges */}
          <View style={styles.metaRow}>
            <View style={styles.capacityBadge}>
              <Ionicons name="people" size={14} color="#1E40AF" />
              <Text style={styles.capacityText}>Max {room.capacity} students</Text>
            </View>

            <View style={styles.equipmentList}>
              {room.equipment.map((eq) => (
                <View key={eq} style={styles.equipmentChip}>
                  <Ionicons name={getEquipmentIcon(eq)} size={12} color="#475569" />
                  <Text style={styles.equipmentText}>{eq}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.locationText} numberOfLines={1}>
              <Ionicons name="location-sharp" size={12} color="#64748B" />{' '}
              {room.locationDetails}
            </Text>

            <View style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>Select Slot</Text>
              <Ionicons name="arrow-forward" size={14} color="#0F52BA" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prev, next) => {
    return (
      prev.room.id === next.room.id &&
      prev.isAvailableNow === next.isAvailableNow
    );
  }
);

RoomCard.displayName = 'RoomCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imageContainer: {
    width: '100%',
    height: 165,
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusAvailable: {
    backgroundColor: 'rgba(236, 253, 245, 0.95)',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusOccupied: {
    backgroundColor: 'rgba(254, 242, 242, 0.95)',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  dotAvailable: {
    backgroundColor: '#10B981',
  },
  dotOccupied: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textAvailable: {
    color: '#065F46',
  },
  textOccupied: {
    color: '#991B1B',
  },
  buildingTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 8,
    gap: 4,
  },
  buildingTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 10,
  },
  metaRow: {
    marginBottom: 10,
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 8,
    gap: 5,
  },
  capacityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  equipmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  equipmentText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
    marginRight: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F52BA',
  },
});
