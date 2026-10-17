import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';
import { createActionHandler } from '../../sdui/ActionDispatcher';
import { themeTokens } from '../../theme/tokens';

export const SectionHeader: React.FC<SDUIComponentProps> = ({ node, context }) => {
  const p = resolveProps(node.props, context);
  const title = String(p.title ?? '');
  const subtitle = p.subtitle ? String(p.subtitle) : null;
  const actionText = p.actionText ? String(p.actionText) : p.showSeeAll ? 'See all' : null;

  const handleAction = createActionHandler(node.actions?.onAction || node.actions?.onSeeAll, context, node);

  return (
    <View style={[styles.container, node.style as any]}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {actionText && (
        <TouchableOpacity
          onPress={handleAction}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.actionText}>{actionText} →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: themeTokens.spacing.lg,
    paddingTop: themeTokens.spacing.lg,
    paddingBottom: themeTokens.spacing.sm,
  },
  textContainer: {
    flex: 1,
    marginRight: themeTokens.spacing.md,
  },
  title: {
    color: themeTokens.colors.textPrimary,
    fontSize: themeTokens.typography.sizes.lg,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: themeTokens.colors.textMuted,
    fontSize: themeTokens.typography.sizes.xs,
    marginTop: 2,
  },
  actionText: {
    color: themeTokens.colors.accent,
    fontSize: themeTokens.typography.sizes.sm,
    fontWeight: '600',
  },
});
