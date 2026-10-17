import React from 'react';
import { Image, StyleSheet, ImageStyle, View } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';
import { themeTokens } from '../../theme/tokens';
import { allowedImageUri } from '../../sdui/runtime';

export const SDUIImage: React.FC<SDUIComponentProps> = ({ node, context }) => {
  const resolvedProps = resolveProps(node.props, context);
  const uri = allowedImageUri(resolvedProps.url || resolvedProps.source || resolvedProps.uri);
  const style = (node.style || {}) as ImageStyle;
  const resizeMode = (resolvedProps.resizeMode || 'cover') as 'cover' | 'contain' | 'stretch' | 'center';

  if (!uri) {
    return (
      <View style={[styles.fallback, style as any]}>
        {/* Placeholder if no URI */}
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.default, style]}
      resizeMode={resizeMode}
    />
  );
};

const styles = StyleSheet.create({
  default: {
    backgroundColor: themeTokens.colors.surfaceElevated,
  },
  fallback: {
    backgroundColor: themeTokens.colors.surfaceElevated,
    borderRadius: themeTokens.radius.md,
  },
});
