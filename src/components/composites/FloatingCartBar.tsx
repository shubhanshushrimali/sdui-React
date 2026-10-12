import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { palette } from '../../theme/tokens';

export const FloatingCartBar: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  const cartCount = useAppStore((state) => state.cartCount);

  if (cartCount <= 0) return null;

  return (
    <View style={styles.floatingContainer}>
      <TouchableOpacity
        style={styles.cartBar}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.left}>
          <Text style={styles.itemCountText}>
            {cartCount} {cartCount === 1 ? 'ITEM' : 'ITEMS'} ADDED
          </Text>
          <Text style={styles.priceSubtext}>₹{cartCount * 280} plus taxes</Text>
        </View>

        <View style={styles.right}>
          <Text style={styles.viewCartText}>VIEW CART</Text>
          <Text style={styles.arrowText}>➔</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 74,
    left: 16,
    right: 16,
    zIndex: 999,
    alignSelf: 'center',
    maxWidth: 560,
    width: '92%',
  },
  cartBar: {
    backgroundColor: '#10B981', // Swiggy emerald green
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  left: {
    flexDirection: 'column',
  },
  itemCountText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  priceSubtext: {
    color: '#D1FAE5',
    fontSize: 11,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewCartText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.8,
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
