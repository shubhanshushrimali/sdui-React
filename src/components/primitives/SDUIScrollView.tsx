import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';

export const SDUIScrollView: React.FC<SDUIComponentProps> = ({
  node,
  context,
  children,
  refreshing,
  onRefresh,
}) => {
  const resolvedProps = resolveProps(node.props, context);
  const horizontal = Boolean(resolvedProps.horizontal);
  const showsScrollIndicator = Boolean(resolvedProps.showsIndicators ?? false);
  const style = (node.style || {}) as ViewStyle;
  const canRefresh = !horizontal && typeof onRefresh === 'function';

  return (
    <ScrollView
      horizontal={horizontal}
      showsHorizontalScrollIndicator={horizontal ? showsScrollIndicator : false}
      showsVerticalScrollIndicator={!horizontal ? showsScrollIndicator : false}
      contentContainerStyle={[
        horizontal ? styles.horizontalContainer : styles.verticalContainer,
        canRefresh && styles.screenRootContainer,
        resolvedProps.contentContainerStyle as ViewStyle,
      ]}
      style={[styles.default, style]}
      refreshControl={
        canRefresh ? (
          <RefreshControl
            refreshing={Boolean(refreshing)}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        ) : undefined
      }
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
  screenRootContainer: {
    flexGrow: 1,
    paddingBottom: 140,
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
});
