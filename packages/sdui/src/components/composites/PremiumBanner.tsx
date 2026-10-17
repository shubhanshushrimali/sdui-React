import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { schemaStyle } from '../../sdui/style';
import { resolveProps } from '../../sdui/TemplateResolver';
import { createActionHandler } from '../../sdui/ActionDispatcher';
import { themeTokens, palette } from '../../theme/tokens';

export const PremiumBanner: React.FC<SDUIComponentProps> = ({ node, context }) => {
  const p = resolveProps(node.props, context);
  const title = String(p.title ?? 'VIP Member Lounge');
  const message = String(p.message ?? 'You have active Pro access. Enjoy zero fee transactions.');

  const handlePress = createActionHandler(node.actions?.onPress, context, node);

  return (
    <View style={[styles.container, schemaStyle(node.style)]}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>👑 VIP ACTIVE</Text>
        </View>
        <TouchableOpacity onPress={handlePress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.switchText}>Switch to Free</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F291E', // Rich emerald-950 backdrop
    borderRadius: themeTokens.radius.xl,
    padding: themeTokens.spacing.xl,
    marginHorizontal: themeTokens.spacing.lg,
    marginVertical: themeTokens.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    shadowColor: palette.emerald500,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: themeTokens.spacing.md,
  },
  badge: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: themeTokens.radius.full,
    borderWidth: 1,
    borderColor: palette.emerald400,
  },
  badgeText: {
    color: palette.emerald400,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  switchText: {
    color: themeTokens.colors.textMuted,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  title: {
    color: palette.white,
    fontSize: themeTokens.typography.sizes.xl,
    fontWeight: '800',
    marginBottom: themeTokens.spacing.xs,
  },
  message: {
    color: '#A7F3D0',
    fontSize: themeTokens.typography.sizes.sm,
    lineHeight: 20,
  },
});
