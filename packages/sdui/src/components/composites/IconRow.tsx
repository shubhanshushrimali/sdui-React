import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { schemaStyle } from '../../sdui/style';
import { resolveProps } from '../../sdui/TemplateResolver';
import { themeTokens, palette } from '../../theme/tokens';
import { selectSDUIValue, useEngineStore } from '../../state/engineState';
import { allowedImageUri } from '../../sdui/runtime';

interface IconItem {
  id: string;
  label: string;
  image?: string;
}

export const IconRow: React.FC<SDUIComponentProps> = ({ node, context }) => {
  const p = resolveProps(node.props, context);
  const title = p.title != null ? String(p.title) : '';
  const stateKey = String(p.stateKey ?? 'activeCategory');
  const accent = String(p.accentColor ?? palette.primary500);
  const items = (Array.isArray(p.items) ? p.items : []) as IconItem[];

  const current = useEngineStore((state) => selectSDUIValue(state, stateKey));
  const setStateValue = useEngineStore((state) => state.setStateValue);

  return (
    <View style={[styles.container, schemaStyle(node.style)]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((item) => {
          const selected = String(current ?? '') === item.id || String(current ?? '') === item.label;
          const image = allowedImageUri(item.image);
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.item}
              activeOpacity={0.75}
              onPress={() => setStateValue(stateKey, item.id)}
            >
              <View style={[styles.ring, selected && { borderColor: accent }]}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
                ) : (
                  <Text style={styles.fallback}>{item.label.slice(0, 1)}</Text>
                )}
              </View>
              <Text style={[styles.label, selected && { color: accent }]} numberOfLines={1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: themeTokens.spacing.md,
    gap: themeTokens.spacing.sm,
  },
  title: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
    paddingHorizontal: themeTokens.spacing.lg,
  },
  row: {
    paddingHorizontal: themeTokens.spacing.lg,
    gap: themeTokens.spacing.lg,
  },
  item: {
    alignItems: 'center',
    width: 68,
  },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: themeTokens.colors.border,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeTokens.colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    color: palette.white,
    fontWeight: '800',
    fontSize: 18,
  },
  label: {
    color: themeTokens.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
});
