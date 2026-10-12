import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';
import { createActionHandler } from '../../sdui/ActionDispatcher';
import { useUserStore } from '../../store/useUserStore';
import { themeTokens, palette } from '../../theme/tokens';

export const SwiggyHeader: React.FC<SDUIComponentProps> = ({ node, context }) => {
  const p = resolveProps(node.props, context);
  const locationTitle = String(p.locationTitle ?? 'Home');
  const locationAddress = String(p.locationAddress ?? '100ft Road, Indiranagar, Bengaluru');
  const placeholder = String(p.searchPlaceholder ?? "Search 'Biryani', 'Cold Coffee', 'Burgers'...");

  const user = useUserStore((state) => state.user);
  const togglePremium = useUserStore((state) => state.togglePremium);

  const handleSearchPress = createActionHandler(node.actions?.onSearchPress, context);
  const handleLocationPress = createActionHandler(node.actions?.onLocationPress, context);

  return (
    <View style={[styles.container, node.style as any]}>
      {/* Top Location Row */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.locationContainer}
          onPress={handleLocationPress}
          activeOpacity={0.7}
        >
          <View style={styles.locationHeader}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationTitle}>{locationTitle}</Text>
            <Text style={styles.arrowIcon}>▼</Text>
          </View>
          <Text style={styles.locationAddress} numberOfLines={1}>
            {locationAddress}
          </Text>
        </TouchableOpacity>

        {/* User VIP Badge / Avatar */}
        <TouchableOpacity
          style={[styles.avatarButton, user.isPremium && styles.avatarButtonGold]}
          onPress={togglePremium}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarText}>
            {user.isPremium ? '👑 GOLD' : '👤'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Swiggy/Zomato Search Bar */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={handleSearchPress}
        activeOpacity={0.85}
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchText} numberOfLines={1}>
          {placeholder}
        </Text>
        <View style={styles.micButton}>
          <Text style={styles.micIcon}>🎙️</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#0B0F19',
    borderBottomWidth: 1,
    borderBottomColor: '#1A2333',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  locationContainer: {
    flex: 1,
    marginRight: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationIcon: {
    fontSize: 16,
  },
  locationTitle: {
    color: palette.white,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  arrowIcon: {
    color: palette.cyan400,
    fontSize: 10,
    marginTop: 2,
  },
  locationAddress: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  avatarButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarButtonGold: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderColor: palette.amber400,
  },
  avatarText: {
    color: palette.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131B2E',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#243048',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchText: {
    flex: 1,
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  micButton: {
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#243048',
  },
  micIcon: {
    fontSize: 14,
  },
});
