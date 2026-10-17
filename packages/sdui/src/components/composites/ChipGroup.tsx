import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { schemaStyle } from '../../sdui/style';
import { resolveProps } from '../../sdui/TemplateResolver';
import { themeTokens, palette } from '../../theme/tokens';
import { selectSDUIValue, useEngineStore } from '../../state/engineState';

export const ChipGroup: React.FC<SDUIComponentProps> = ({ node, context }) => {
  const p = resolveProps(node.props, context);
  const chips = (p.chips as { id: string; label: string }[]) || [
    { id: 'All', label: 'All' },
  ];
  const stateKey = String(p.stateKey ?? 'activeCategory');
  const accent = String(p.accentColor ?? palette.primary600);

  const current = useEngineStore((state) => selectSDUIValue(state, stateKey));
  const setStateValue = useEngineStore((state) => state.setStateValue);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={schemaStyle(node.style)}
    >
      {chips.map((chip) => {
        const isSelected = String(current ?? '') === chip.id || String(current ?? '') === chip.label;
        return (
          <TouchableOpacity
            key={chip.id}
            onPress={() => setStateValue(stateKey, chip.id)}
            activeOpacity={0.7}
            style={[styles.chip, isSelected && { backgroundColor: accent, borderColor: accent }]}
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
