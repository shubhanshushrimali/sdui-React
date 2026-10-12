import React from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';

export const SDUIScrollView: React.FC<SDUIComponentProps> = ({ node, context, children }) => {
  const resolvedProps = resolveProps(node.props, context);
  const horizontal = Boolean(resolvedProps.horizontal);
  const showsScrollIndicator = Boolean(resolvedProps.showsIndicators ?? false);
  const style = (node.style || {}) as ViewStyle;

  return (
    <ScrollView
      horizontal={horizontal}
      showsHorizontalScrollIndicator={horizontal ? showsScrollIndicator : false}
      showsVerticalScrollIndicator={!horizontal ? showsScrollIndicator : false}
      contentContainerStyle={[
        horizontal ? styles.horizontalContainer : styles.verticalContainer,
        resolvedProps.contentContainerStyle as ViewStyle,
      ]}
      style={[styles.default, style]}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  default: {
    flex: 1,
  },
  verticalContainer: {
    paddingBottom: 40,
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
});
