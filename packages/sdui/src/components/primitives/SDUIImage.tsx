import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';
import { themeTokens } from '../../theme/tokens';
import { allowedImageUri } from '../../sdui/runtime';
import { imageStyle } from '../../sdui/style';

export const SDUIImage: React.FC<SDUIComponentProps> = ({ node, context }) => {
  const resolvedProps = resolveProps(node.props, context);
  const uri = allowedImageUri(resolvedProps.url || resolvedProps.source || resolvedProps.uri);
  const style = imageStyle(node.style);
  const resizeMode = (resolvedProps.resizeMode || 'cover') as 'cover' | 'contain' | 'stretch' | 'center';

  if (!uri) {
    return (
      <View style={[styles.fallback, style]}>
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
