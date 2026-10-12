import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';
import { createActionHandler } from '../../sdui/ActionDispatcher';
import { useAppStore } from '../../store/useAppStore';
import { palette } from '../../theme/tokens';

export const RestaurantDishCard: React.FC<SDUIComponentProps> = ({ node, context }) => {
  const p = resolveProps(node.props, context);
  const id = String(p.id ?? 'dish_1');
  const title = String(p.title ?? 'Special Handi Dum Biryani');
  const restaurant = String(p.restaurant ?? 'Meghana Foods');
  const cuisine = String(p.cuisine ?? 'Biryani • North Indian');
  const rating = String(p.rating ?? '4.4');
  const deliveryTime = String(p.deliveryTime ?? '25-30 mins');
  const distance = String(p.distance ?? '2.1 km');
  const price = String(p.price ?? '₹299');
  const originalPrice = p.originalPrice ? String(p.originalPrice) : null;
  const discountRibbon = p.discountRibbon ? String(p.discountRibbon) : '60% OFF UP TO ₹120';
  const isVeg = p.isVeg === true;
  const image =
    (p.image as string) ||
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80';

  const [quantity, setQuantity] = useState(0);
  const incrementCart = useAppStore((state) => state.incrementCart);

  const handlePress = createActionHandler(node.actions?.onPress, context);

  const handleAdd = () => {
    setQuantity((q) => q + 1);
    incrementCart();
  };

  const handleMinus = () => {
    setQuantity((q) => Math.max(0, q - 1));
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={handlePress}
      style={[styles.card, node.style as any]}
    >
      {/* Food Hero Image with Discount Banner */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />

        {/* Swiggy Discount Ribbon */}
        {discountRibbon ? (
          <View style={styles.discountRibbon}>
            <Text style={styles.discountText}>🏷️ {discountRibbon}</Text>
          </View>
        ) : null}

        {/* Veg / Non-Veg Indicator Icon */}
        <View style={styles.vegIconBox}>
          <View style={[styles.vegDot, { backgroundColor: isVeg ? '#10B981' : '#EF4444' }]} />
        </View>

        {/* Swiggy Iconic "+ ADD" / Stepper Button */}
        <View style={styles.addButtonWrapper}>
          {quantity === 0 ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAdd}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>ADD</Text>
              <Text style={styles.addPlusSign}>+</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.stepperButton}>
              <TouchableOpacity onPress={handleMinus} style={styles.stepTouch}>
                <Text style={styles.stepText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepCount}>{quantity}</Text>
              <TouchableOpacity onPress={handleAdd} style={styles.stepTouch}>
                <Text style={styles.stepText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Content Details */}
      <View style={styles.details}>
        {/* Rating & Delivery Stats Pill */}
        <View style={styles.metaRow}>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingStar}>★</Text>
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{deliveryTime}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{distance}</Text>
        </View>

        {/* Dish Title */}
        <Text style={styles.dishTitle} numberOfLines={1}>
          {title}
        </Text>

        {/* Restaurant & Cuisine */}
        <Text style={styles.restaurantName} numberOfLines={1}>
          {restaurant}
        </Text>
        <Text style={styles.cuisineText} numberOfLines={1}>
          {cuisine}
        </Text>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{price}</Text>
          {originalPrice ? (
            <Text style={styles.originalPrice}>{originalPrice}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1F2937',
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountRibbon: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(11, 15, 25, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  discountText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  vegIconBox: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  addButtonWrapper: {
    position: 'absolute',
    bottom: -16,
    alignSelf: 'center',
    zIndex: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 26,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
    gap: 4,
  },
  addButtonText: {
    color: '#10B981', // Swiggy green
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  addPlusSign: {
    color: '#10B981',
    fontWeight: '900',
    fontSize: 14,
  },
  stepperButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
    gap: 12,
  },
  stepTouch: {
    paddingHorizontal: 6,
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  stepCount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  details: {
    padding: 16,
    paddingTop: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#065F46', // Dark emerald
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  ratingStar: {
    color: '#FBBF24',
    fontSize: 10,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  metaDot: {
    color: '#64748B',
    fontSize: 10,
  },
  metaText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  dishTitle: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  restaurantName: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  cuisineText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 10,
    gap: 8,
  },
  price: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '800',
  },
  originalPrice: {
    color: '#64748B',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
});
