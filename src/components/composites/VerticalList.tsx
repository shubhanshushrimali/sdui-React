import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SDUIComponentProps, SDUINode } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';
import { themeTokens } from '../../theme/tokens';

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

  let itemsToRender: any[] = [];
  if (dataSource && Array.isArray(dataSource.data)) {
    itemsToRender = dataSource.data;
  }

  return (
    <View style={[styles.container, { gap }, node.style as any]}>
      {dataSource && itemTemplate && renderChildNode
        ? itemsToRender.map((item, index) => {
            const itemContext = {
              ...context,
              item,
              index,
            };
            return (
              <View key={item.id ? String(item.id) : `v-item-${index}`}>
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
});
