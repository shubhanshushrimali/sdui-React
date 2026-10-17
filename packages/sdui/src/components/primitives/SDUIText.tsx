import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { resolveProps, resolveTemplate } from '../../sdui/TemplateResolver';
import { themeTokens } from '../../theme/tokens';
import { schemaStyle } from '../../sdui/style';

export const SDUIText: React.FC<SDUIComponentProps> = ({ node, context }) => {
  const resolvedProps = resolveProps(node.props, context);
  const textContent = (resolvedProps.text as string) ?? (resolvedProps.content as string) ?? '';
  const resolvedText = resolveTemplate(textContent, context);
  const style = schemaStyle(node.style);

  return (
    <Text
      style={[
        styles.default,
        style,
      ]}
      numberOfLines={resolvedProps.numberOfLines as number | undefined}
      ellipsizeMode={resolvedProps.ellipsizeMode as 'head' | 'middle' | 'tail' | 'clip' | undefined}
    >
      {String(resolvedText)}
    </Text>
  );
};

const styles = StyleSheet.create({
  default: {
    color: themeTokens.colors.textPrimary,
    fontSize: themeTokens.typography.sizes.base,
  },
});
