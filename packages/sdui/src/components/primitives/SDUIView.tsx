import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';
import { schemaStyle } from '../../sdui/style';

export const SDUIView: React.FC<SDUIComponentProps> = ({ node, context, children }) => {
  const resolvedProps = resolveProps(node.props, context);
  const style = schemaStyle(node.style);

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
