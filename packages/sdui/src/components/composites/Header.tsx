import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';
import { createActionHandler } from '../../sdui/ActionDispatcher';
import { themeTokens, palette } from '../../theme/tokens';

export const Header: React.FC<SDUIComponentProps> = ({ node, context }) => {
  const p = resolveProps(node.props, context);
  const title = p.title != null ? String(p.title) : '';
  const subtitle = p.subtitle != null ? String(p.subtitle) : '';
  const searchPlaceholder = p.searchPlaceholder != null ? String(p.searchPlaceholder) : '';
  const trailingLabel = p.trailingLabel != null ? String(p.trailingLabel) : '';
  const accent = String(p.accentColor ?? themeTokens.colors.accent);

  const handlePress = createActionHandler(node.actions?.onPress, context, node);
  const handleSearch = createActionHandler(node.actions?.onSearchPress, context, node);
  const handleTrailing = createActionHandler(node.actions?.onTrailingPress, context, node);

  return (
    <View style={[styles.container, node.style as any]}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.titles}
          onPress={handlePress}
          disabled={!handlePress}
          activeOpacity={0.7}
        >
          {title ? <Text style={[styles.title, { color: accent }]}>{title}</Text> : null}
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </TouchableOpacity>

        {trailingLabel ? (
          <TouchableOpacity onPress={handleTrailing} disabled={!handleTrailing} activeOpacity={0.8}>
            <Text style={styles.trailing}>{trailingLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {searchPlaceholder ? (
        <TouchableOpacity
          style={styles.search}
          onPress={handleSearch}
          disabled={!handleSearch}
          activeOpacity={0.85}
        >
          <Text style={styles.searchText} numberOfLines={1}>
            {searchPlaceholder}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: themeTokens.spacing.lg,
    paddingTop: themeTokens.spacing.md,
    paddingBottom: themeTokens.spacing.sm,
    gap: themeTokens.spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: themeTokens.spacing.md,
  },
  titles: {
    flex: 1,
  },
  title: {
    fontSize: themeTokens.typography.sizes.xl,
    fontWeight: '800',
  },
  subtitle: {
    color: themeTokens.colors.textSecondary,
    fontSize: themeTokens.typography.sizes.sm,
    marginTop: 2,
  },
  trailing: {
    color: palette.white,
    fontSize: 12,
    fontWeight: '700',
  },
  search: {
    backgroundColor: themeTokens.colors.surface,
    borderRadius: themeTokens.radius.lg,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    paddingHorizontal: themeTokens.spacing.md,
    paddingVertical: 12,
  },
  searchText: {
    color: themeTokens.colors.textMuted,
    fontSize: themeTokens.typography.sizes.sm,
  },
});
