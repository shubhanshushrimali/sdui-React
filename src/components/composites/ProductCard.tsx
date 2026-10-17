import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';
import { createActionHandler } from '../../sdui/ActionDispatcher';
import { themeTokens, palette } from '../../theme/tokens';
import { useAppStore } from '../../store/useAppStore';

export const ProductCard: React.FC<SDUIComponentProps> = ({ node, context }) => {
  const p = resolveProps(node.props, context);
  const id = String(p.id ?? 'item_default');
  const title = String(p.title ?? 'Product Title');
  const price = p.price !== undefined ? String(p.price) : '$49.99';
  const originalPrice = p.originalPrice ? String(p.originalPrice) : null;
  const rating = p.rating ? String(p.rating) : '4.9';
  const tag = p.tag ? String(p.tag) : null;
  const image = (p.image as string) || (p.thumbnail as string) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';

  const handlePress = createActionHandler(node.actions?.onPress, context, node);

  const likedItemIds = useAppStore((state) => state.likedItemIds);
  const toggleLike = useAppStore((state) => state.toggleLike);
  const isLiked = likedItemIds.includes(id);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={[styles.container, node.style as any]}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />

        {tag && (
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.heartButton, isLiked && styles.heartButtonActive]}
          onPress={() => toggleLike(id)}
          activeOpacity={0.7}
        >
          <Text style={styles.heartIcon}>{isLiked ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.ratingRow}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.ratingText}>{rating}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{price}</Text>
          {originalPrice && <Text style={styles.originalPrice}>{originalPrice}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 170,
    backgroundColor: themeTokens.colors.surface,
    borderRadius: themeTokens.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    marginRight: themeTokens.spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: themeTokens.colors.surfaceElevated,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  tagBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: themeTokens.radius.sm,
  },
  tagText: {
    color: palette.cyan400,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(11, 15, 25, 0.65)',
    borderRadius: themeTokens.radius.full,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartButtonActive: {
    backgroundColor: 'rgba(244, 63, 94, 0.25)',
  },
  heartIcon: {
    fontSize: 12,
  },
  content: {
    padding: themeTokens.spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  star: {
    color: palette.amber400,
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    color: themeTokens.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    color: themeTokens.colors.textPrimary,
    fontSize: themeTokens.typography.sizes.sm,
    fontWeight: '600',
    lineHeight: 18,
    minHeight: 36,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
    gap: 6,
  },
  price: {
    color: palette.emerald400,
    fontSize: themeTokens.typography.sizes.base,
    fontWeight: '800',
  },
  originalPrice: {
    color: themeTokens.colors.textMuted,
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
});
