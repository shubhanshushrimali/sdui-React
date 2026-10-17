import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { SDUIComponentProps, SDUINode } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';
import { resolveListItems } from '../../sdui/resolveListItems';
import { themeTokens } from '../../theme/tokens';
import { selectSDUIValue, useAppStore } from '../../store/useAppStore';

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
  const dataSource = node.dataSource;
  const itemTemplate = node.itemTemplate;
  const stateKey = dataSource?.type === 'state' ? dataSource.stateKey : undefined;
  const stateValue = useAppStore((state) => selectSDUIValue(state, stateKey));
  const itemsToRender = resolveListItems(dataSource, stateValue);
  const filteredEmpty =
    dataSource?.type === 'state' &&
    itemsToRender.length === 0 &&
    Array.isArray(dataSource.data) &&
    dataSource.data.length > 0;

  return (
    <View style={[styles.container, { gap }, node.style as any]}>
      {filteredEmpty ? <Text style={styles.emptyText}>Nothing matches this filter.</Text> : null}
      {dataSource && itemTemplate && renderChildNode
        ? itemsToRender.map((item, index) => {
            const record = item && typeof item === 'object' ? (item as Record<string, unknown>) : null;
            const itemContext = {
              ...context,
              item,
              index,
            };
            return (
              <View key={record?.id != null ? String(record.id) : `v-item-${index}`}>
                {renderChildNode(itemTemplate, itemContext)}
              </View>
            );
          })
        : children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: themeTokens.spacing.lg,
    marginVertical: themeTokens.spacing.sm,
  },
  emptyText: {
    color: themeTokens.colors.textMuted,
    fontSize: 13,
    paddingVertical: themeTokens.spacing.sm,
  },
});
