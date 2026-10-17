import React from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import { SDUIComponentProps, SDUINode } from '../../sdui/types';
import { schemaStyle } from '../../sdui/style';
import { resolveProps } from '../../sdui/TemplateResolver';
import { resolveListItems } from '../../sdui/resolveListItems';
import { themeTokens } from '../../theme/tokens';
import { selectSDUIValue, useEngineStore } from '../../state/engineState';

interface ListComponentProps extends SDUIComponentProps {
  renderChildNode?: (node: SDUINode, itemContext: any) => React.ReactNode;
}

export const VerticalList: React.FC<ListComponentProps> = ({
  node,
  context,
  children,
  renderChildNode,
}) => {
  const p = resolveProps(node.props, context);
  const gap = Number(p.gap ?? themeTokens.spacing.md);
  const windowHeight = Number(p.height);
  const bounded = Number.isFinite(windowHeight) && windowHeight > 0;
  const dataSource = node.dataSource;
  const itemTemplate = node.itemTemplate;
  const stateKey = dataSource?.type === 'state' ? dataSource.stateKey : undefined;
  const stateValue = useEngineStore((state) => selectSDUIValue(state, stateKey));
  const itemsToRender = resolveListItems(dataSource, stateValue);
  const filteredEmpty =
    dataSource?.type === 'state' &&
    itemsToRender.length === 0 &&
    Array.isArray(dataSource.data) &&
    dataSource.data.length > 0;

  if (dataSource && itemTemplate && renderChildNode) {
    return (
      <FlatList
        data={itemsToRender}
        keyExtractor={(item, index) => {
          const record = item && typeof item === 'object' ? (item as Record<string, unknown>) : null;
          return record?.id != null ? String(record.id) : `v-item-${index}`;
        }}
        renderItem={({ item, index }) => (
          <View>{renderChildNode(itemTemplate, { ...context, item, index })}</View>
        )}
        ListEmptyComponent={
          filteredEmpty ? <Text style={styles.emptyText}>Nothing matches this filter.</Text> : null
        }
        scrollEnabled={bounded}
        nestedScrollEnabled={bounded}
        style={[styles.container, bounded ? { height: windowHeight } : null, schemaStyle(node.style)]}
        contentContainerStyle={bounded ? { gap } : { gap, flexGrow: 0 }}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={bounded}
      />
    );
  }

  return <View style={[styles.container, { gap }, schemaStyle(node.style)]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: themeTokens.spacing.lg,
    marginVertical: themeTokens.spacing.sm,
    flexGrow: 0,
  },
  emptyText: {
    color: themeTokens.colors.textMuted,
    fontSize: 13,
    paddingVertical: themeTokens.spacing.sm,
  },
});
