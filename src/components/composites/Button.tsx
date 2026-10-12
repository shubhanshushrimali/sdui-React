import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';
import { createActionHandler } from '../../sdui/ActionDispatcher';
import { themeTokens, palette } from '../../theme/tokens';

export const Button: React.FC<SDUIComponentProps> = ({ node, context }) => {
  const p = resolveProps(node.props, context);
  const title = String(p.title ?? p.text ?? 'Button');
  const variant = (p.variant as 'primary' | 'secondary' | 'outline' | 'danger') || 'primary';
  const size = (p.size as 'sm' | 'md' | 'lg') || 'md';

  const handlePress = createActionHandler(node.actions?.onPress, context);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        node.style as any,
      ]}
    >
      <Text style={[styles.textBase, styles[`text_${variant}`]]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: themeTokens.radius.md,
  },
  size_sm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  size_md: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  size_lg: {
    paddingVertical: 16,
    paddingHorizontal: 26,
  },
  primary: {
    backgroundColor: palette.primary600,
  },
  secondary: {
    backgroundColor: themeTokens.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: palette.primary500,
  },
  danger: {
    backgroundColor: palette.rose500,
  },
  textBase: {
    fontWeight: '700',
    fontSize: themeTokens.typography.sizes.sm,
  },
  text_primary: {
    color: palette.white,
  },
  text_secondary: {
    color: themeTokens.colors.textPrimary,
  },
  text_outline: {
    color: palette.cyan400,
  },
  text_danger: {
    color: palette.white,
  },
});
