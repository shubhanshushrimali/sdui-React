import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';
import { createActionHandler } from '../../sdui/ActionDispatcher';
import { themeTokens, palette } from '../../theme/tokens';
import { useUserStore } from '../../store/useUserStore';

export const UpgradeCTA: React.FC<SDUIComponentProps> = ({ node, context }) => {
  const p = resolveProps(node.props, context);
  const title = String(p.title ?? 'Unlock SDUI Pro Access');
  const message = String(
    p.message ?? 'Get real-time dynamic widgets, instant remote overrides, and VIP privileges.'
  );
  const buttonText = String(p.buttonText ?? 'Upgrade to Pro');

  const togglePremium = useUserStore((state) => state.togglePremium);

  // We can either trigger custom action or local demo toggle
  const handleUpgrade = () => {
    togglePremium();
    if (node.actions?.onPress) {
      createActionHandler(node.actions.onPress, context, node)?.();
    }
  };

  return (
    <View style={[styles.container, node.style as any]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>PRO FEATURE</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleUpgrade}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>⚡ {buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1B4B',
    borderRadius: themeTokens.radius.xl,
    padding: themeTokens.spacing.xl,
    marginHorizontal: themeTokens.spacing.lg,
    marginVertical: themeTokens.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    shadowColor: palette.primary500,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  badge: {
    backgroundColor: 'rgba(238, 242, 255, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: themeTokens.radius.full,
    borderWidth: 1,
    borderColor: palette.cyan400,
    marginBottom: themeTokens.spacing.md,
  },
  badgeText: {
    color: palette.cyan400,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    color: themeTokens.colors.textPrimary,
    fontSize: themeTokens.typography.sizes.xl,
    fontWeight: '800',
    marginBottom: themeTokens.spacing.xs,
  },
  message: {
    color: themeTokens.colors.textSecondary,
    fontSize: themeTokens.typography.sizes.sm,
    lineHeight: 20,
    marginBottom: themeTokens.spacing.lg,
  },
  button: {
    backgroundColor: palette.primary600,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: themeTokens.radius.md,
    alignItems: 'center',
  },
  buttonText: {
    color: palette.white,
    fontWeight: '700',
    fontSize: themeTokens.typography.sizes.sm,
  },
});
