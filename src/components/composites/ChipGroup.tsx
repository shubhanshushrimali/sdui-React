import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';
import { themeTokens, palette } from '../../theme/tokens';
import { useAppStore } from '../../store/useAppStore';

export const ChipGroup: React.FC<SDUIComponentProps> = ({ node, context }) => {
  const p = resolveProps(node.props, context);
  const chips = (p.chips as Array<{ id: string; label: string; icon?: string }>) || [
    { id: 'All', label: 'All Items' },
    { id: 'New', label: '⚡ New Arrivals' },
    { id: 'Trending', label: '🔥 Trending' },
    { id: 'Sale', label: '🏷️ Deals' },
  ];

  const activeCategory = useAppStore((state) => state.activeCategory);
  const setActiveCategory = useAppStore((state) => state.setActiveCategory);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={node.style as any}
    >
      {chips.map((chip) => {
        const isSelected = activeCategory === chip.id || activeCategory === chip.label;
        return (
          <TouchableOpacity
            key={chip.id}
            onPress={() => setActiveCategory(chip.id)}
            activeOpacity={0.7}
            style={[styles.chip, isSelected && styles.chipActive]}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: themeTokens.spacing.lg,
    paddingVertical: themeTokens.spacing.sm,
    gap: themeTokens.spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: themeTokens.radius.full,
    backgroundColor: themeTokens.colors.surface,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
  },
  chipActive: {
    backgroundColor: palette.primary600,
    borderColor: palette.primary500,
  },
  chipText: {
    color: themeTokens.colors.textSecondary,
    fontSize: themeTokens.typography.sizes.xs,
    fontWeight: '600',
  },
  chipTextActive: {
    color: palette.white,
    fontWeight: '700',
  },
});
