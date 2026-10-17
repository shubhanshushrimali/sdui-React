import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';
import { createActionHandler } from '../../sdui/ActionDispatcher';
import { themeTokens, palette } from '../../theme/tokens';
import { allowedImageUri } from '../../sdui/runtime';

function textOrNull(value: unknown): string | null {
  if (value == null || value === '') return null;
  const text = String(value);
  if (text.includes('{{')) return null;
  return text;
}

export const Card: React.FC<SDUIComponentProps> = ({ node, context }) => {
  const p = resolveProps(node.props, context);
  const title = textOrNull(p.title) ?? '';
  const subtitle = textOrNull(p.subtitle);
  const meta = textOrNull(p.meta);
  const price = textOrNull(p.price);
  const compareAt = textOrNull(p.compareAt);
  const badge = textOrNull(p.badge);
  const actionLabel = textOrNull(p.actionLabel);
  const image = allowedImageUri(textOrNull(p.image));
  const accent = String(p.accentColor ?? palette.primary500);

  const handlePress = createActionHandler(node.actions?.onPress, context, node);
  const handleAction = createActionHandler(
    node.actions?.onAction || node.actions?.onPress,
    context,
    node
  );

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      disabled={!handlePress}
      style={[styles.card, node.style as any]}
    >
      {image ? (
        <View style={styles.imageWrap}>
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
          {badge ? (
            <View style={[styles.badge, { backgroundColor: accent }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.body}>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        {title ? (
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}

        {(price || actionLabel) && (
          <View style={styles.footer}>
            <View style={styles.priceRow}>
              {price ? <Text style={styles.price}>{price}</Text> : null}
              {compareAt ? <Text style={styles.compareAt}>{compareAt}</Text> : null}
            </View>
            {actionLabel ? (
              <TouchableOpacity onPress={handleAction} activeOpacity={0.8} style={[styles.action, { borderColor: accent }]}>
                <Text style={[styles.actionText, { color: accent }]}>{actionLabel}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: themeTokens.colors.surface,
    borderRadius: themeTokens.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
  },
  imageWrap: {
    height: 140,
    backgroundColor: themeTokens.colors.surfaceElevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: themeTokens.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: palette.white,
    fontSize: 10,
    fontWeight: '800',
  },
  body: {
    padding: themeTokens.spacing.md,
    gap: 4,
  },
  meta: {
    color: themeTokens.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    color: themeTokens.colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  price: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '800',
  },
  compareAt: {
    color: themeTokens.colors.textMuted,
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  action: {
    borderWidth: 1,
    borderRadius: themeTokens.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
