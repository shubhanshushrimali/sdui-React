import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';

export const SDUIView: React.FC<SDUIComponentProps> = ({ node, context, children }) => {
  const resolvedProps = resolveProps(node.props, context);
  const style = (node.style || {}) as ViewStyle;

  return (
    <View style={[styles.default, style]} {...resolvedProps}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  default: {
    // Default base container style
  },
});
