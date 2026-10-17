import React from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';
import { schemaStyle } from '../../sdui/style';

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
  const style = schemaStyle(node.style);
  const canRefresh = !horizontal && typeof onRefresh === 'function';

  return (
    <ScrollView
      horizontal={horizontal}
      showsHorizontalScrollIndicator={horizontal ? showsScrollIndicator : false}
      showsVerticalScrollIndicator={!horizontal ? showsScrollIndicator : false}
      contentContainerStyle={[
        horizontal ? styles.horizontalContainer : styles.verticalContainer,
        canRefresh && styles.screenRootContainer,
        schemaStyle(resolvedProps.contentContainerStyle),
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
