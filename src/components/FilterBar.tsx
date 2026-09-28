import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BuildingId, EquipmentItem } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  selectedBuilding: BuildingId | 'All';
  onBuildingSelect: (building: BuildingId | 'All') => void;
  selectedCapacity: 'All' | '2-4' | '5-8' | '9-20';
  onCapacitySelect: (capacity: 'All' | '2-4' | '5-8' | '9-20') => void;
  selectedEquipment: EquipmentItem[];
  onEquipmentToggle: (item: EquipmentItem) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
}

const BUILDINGS: (BuildingId | 'All')[] = ['All', 'A', 'B', 'C', 'V'];
const CAPACITIES: ('All' | '2-4' | '5-8' | '9-20')[] = ['All', '2-4', '5-8', '9-20'];
const EQUIPMENT_LIST: EquipmentItem[] = ['Projector', 'Whiteboard', 'High-spec PC', 'AC'];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedBuilding,
  onBuildingSelect,
  selectedCapacity,
  onCapacitySelect,
  selectedEquipment,
  onEquipmentToggle,
  onResetFilters,
  activeFilterCount,
}) => {
  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search room (e.g. B.302, AI Lab, Projector)..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={onSearchChange}
            clearButtonMode="while-editing"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => onSearchChange('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {activeFilterCount > 0 && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={onResetFilters}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={14} color="#EF4444" />
            <Text style={styles.resetButtonText}>Reset ({activeFilterCount})</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Building Filter Row */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionLabel}>Building:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {BUILDINGS.map((bldg) => {
            const isSelected = selectedBuilding === bldg;
            return (
              <TouchableOpacity
                key={bldg}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => onBuildingSelect(bldg)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {bldg === 'All' ? 'All Wings' : `Bldg ${bldg}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Capacity & Equipment Filter Row */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionLabel}>Capacity:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {CAPACITIES.map((cap) => {
            const isSelected = selectedCapacity === cap;
            return (
              <TouchableOpacity
                key={cap}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => onCapacitySelect(cap)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {cap === 'All' ? 'Any size' : `${cap} seats`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Equipment Row */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionLabel}>Equip:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {EQUIPMENT_LIST.map((eq) => {
            const isSelected = selectedEquipment.includes(eq);
            return (
              <TouchableOpacity
                key={eq}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => onEquipmentToggle(eq)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isSelected ? 'checkbox' : 'square-outline'}
                  size={12}
                  color={isSelected ? '#FFFFFF' : '#64748B'}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {eq}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 4,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
    paddingLeft: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    width: 60,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  chipsContainer: {
    paddingRight: 16,
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#0F52BA',
    borderColor: '#0F52BA',
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
