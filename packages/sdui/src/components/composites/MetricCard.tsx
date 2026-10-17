import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { schemaStyle } from '../../sdui/style';
import { resolveProps } from '../../sdui/TemplateResolver';
import { themeTokens, palette } from '../../theme/tokens';

export const MetricCard: React.FC<SDUIComponentProps> = ({ node, context }) => {
  const p = resolveProps(node.props, context);
  const label = String(p.label ?? 'Metric');
  const value = String(p.value ?? '0');
  const change = p.change ? String(p.change) : null;
  const isPositive = p.isPositive !== false;

  return (
    <View style={[styles.card, schemaStyle(node.style)]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Text style={styles.value}>{value}</Text>
        {change && (
          <View
            style={[
              styles.changeBadge,
              { backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)' },
            ]}
          >
            <Text
              style={[
                styles.changeText,
                { color: isPositive ? palette.emerald400 : palette.rose500 },
              ]}
            >
              {isPositive ? '↑' : '↓'} {change}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: themeTokens.colors.surface,
    padding: themeTokens.spacing.lg,
    borderRadius: themeTokens.radius.lg,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    minWidth: 150,
    flex: 1,
  },
  label: {
    color: themeTokens.colors.textMuted,
    fontSize: themeTokens.typography.sizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  value: {
    color: themeTokens.colors.textPrimary,
    fontSize: themeTokens.typography.sizes.xl,
    fontWeight: '800',
  },
  changeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: themeTokens.radius.sm,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
