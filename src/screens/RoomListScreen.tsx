import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Room } from '../types';
import { useBookingStore } from '../store/useBookingStore';
import { RoomCard } from '../components/RoomCard';
import { FilterBar } from '../components/FilterBar';

const CARD_HEIGHT_ESTIMATE = 338; // for smooth FlatList scroll layout

export const RoomListScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [refreshing, setRefreshing] = useState(false);

  // Zustand State & Selectors
  const rooms = useBookingStore((s) => s.rooms);
  const filters = useBookingStore((s) => s.filters);
  const isRoomAvailableNow = useBookingStore((s) => s.isRoomAvailableNow);
  const userSession = useBookingStore((s) => s.userSession);
  const setSearchQuery = useBookingStore((s) => s.setSearchQuery);
  const setBuildingFilter = useBookingStore((s) => s.setBuildingFilter);
  const setCapacityFilter = useBookingStore((s) => s.setCapacityFilter);
  const toggleEquipmentFilter = useBookingStore((s) => s.toggleEquipmentFilter);
  const resetFilters = useBookingStore((s) => s.resetFilters);

  // Filter application
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // 1. Text Search
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesName = room.name.toLowerCase().includes(query);
        const matchesDesc = room.description.toLowerCase().includes(query);
        const matchesLoc = room.locationDetails.toLowerCase().includes(query);
        const matchesEquip = room.equipment.some((eq) =>
          eq.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesDesc && !matchesLoc && !matchesEquip) {
          return false;
        }
      }

      // 2. Building Filter
      if (filters.building !== 'All' && room.building !== filters.building) {
        return false;
      }

      // 3. Capacity Filter
      if (filters.capacityRange !== 'All') {
        if (filters.capacityRange === '2-4' && (room.capacity < 2 || room.capacity > 4)) {
          return false;
        }
        if (filters.capacityRange === '5-8' && (room.capacity < 5 || room.capacity > 8)) {
          return false;
        }
        if (filters.capacityRange === '9-20' && room.capacity < 9) {
          return false;
        }
      }

      // 4. Equipment Filter (all selected must match)
      if (filters.selectedEquipment.length > 0) {
        const hasAllEquipment = filters.selectedEquipment.every((eq) =>
          room.equipment.includes(eq)
        );
        if (!hasAllEquipment) return false;
      }

      return true;
    });
  }, [rooms, filters]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.building !== 'All') count++;
    if (filters.capacityRange !== 'All') count++;
    count += filters.selectedEquipment.length;
    if (filters.searchQuery.trim().length > 0) count++;
    return count;
  }, [filters]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

  const handleRoomPress = useCallback(
    (room: Room) => {
      navigation.navigate('RoomDetail', { roomId: room.id });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Room }) => {
      const isAvailable = isRoomAvailableNow(item.id);
      return (
        <RoomCard
          room={item}
          isAvailableNow={isAvailable}
          onPress={handleRoomPress}
        />
      );
    },
    [isRoomAvailableNow, handleRoomPress]
  );

  const keyExtractor = useCallback((item: Room) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: CARD_HEIGHT_ESTIMATE,
      offset: CARD_HEIGHT_ESTIMATE * index,
      index,
    }),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Campus Top Brand Bar */}
      <View style={styles.topBar}>
        <View>
          <View style={styles.brandRow}>
            <Ionicons name="school" size={18} color="#0F52BA" />
            <Text style={styles.brandSubtitle}>VKU SMART CAMPUS</Text>
          </View>
          <Text style={styles.brandTitle}>Study Room Booking</Text>
        </View>

        <TouchableOpacity
          style={styles.sessionBadge}
          onPress={() => navigation.navigate('ProfileTab')}
          activeOpacity={0.8}
        >
          <View style={styles.avatarMini}>
            <Text style={styles.avatarText}>
              {userSession.studentId.slice(0, 4)}
            </Text>
          </View>
          <Text style={styles.sessionStudentId}>{userSession.studentId}</Text>
        </TouchableOpacity>
      </View>

      {/* Multi-parameter Filter Bar */}
      <FilterBar
        searchQuery={filters.searchQuery}
        onSearchChange={setSearchQuery}
        selectedBuilding={filters.building}
        onBuildingSelect={setBuildingFilter}
        selectedCapacity={filters.capacityRange}
        onCapacitySelect={setCapacityFilter}
        selectedEquipment={filters.selectedEquipment}
        onEquipmentToggle={toggleEquipmentFilter}
        onResetFilters={resetFilters}
        activeFilterCount={activeFilterCount}
      />

      {/* Rooms Counter Header */}
      <View style={styles.counterRow}>
        <Text style={styles.counterText}>
          Showing <Text style={styles.counterBold}>{filteredRooms.length}</Text>{' '}
          {filteredRooms.length === 1 ? 'room' : 'rooms'}
        </Text>
        <Text style={styles.liveIndicator}>
          <Text style={styles.liveDot}>● </Text>Real-time availability
        </Text>
      </View>

      {/* Optimized 60fps FlatList Feed */}
      <FlatList
        data={filteredRooms}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0F52BA']}
            tintColor="#0F52BA"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No matching study rooms</Text>
            <Text style={styles.emptyDesc}>
              Try adjusting your building, capacity, or equipment filters.
            </Text>
            <TouchableOpacity
              style={styles.emptyResetBtn}
              onPress={resetFilters}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyResetBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F52BA',
    letterSpacing: 1.2,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    gap: 6,
  },
  avatarMini: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F52BA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  sessionStudentId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  counterText: {
    fontSize: 13,
    color: '#64748B',
  },
  counterBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  liveIndicator: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  liveDot: {
    fontSize: 10,
    color: '#10B981',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 36,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    maxWidth: 260,
  },
  emptyResetBtn: {
    backgroundColor: '#0F52BA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  emptyResetBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
