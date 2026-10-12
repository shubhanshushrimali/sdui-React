import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { SDUIComponentProps, SDUINode } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';
import { themeTokens } from '../../theme/tokens';
import { useAppStore } from '../../store/useAppStore';

// We receive renderNode callback from SDUIRenderer via context or prop
interface ListComponentProps extends SDUIComponentProps {
  renderChildNode?: (node: SDUINode, itemContext: any) => React.ReactNode;
}

export const HorizontalList: React.FC<ListComponentProps> = ({
  node,
  context,
  children,
  renderChildNode,
}) => {
  const p = resolveProps(node.props, context);
  const itemSpacing = Number(p.itemSpacing ?? themeTokens.spacing.md);
  const dataSource = node.dataSource;
  const itemTemplate = node.itemTemplate;

  const [remoteData, setRemoteData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If dataSource is "state", grab state from store
  const activeCategory = useAppStore((state) => state.activeCategory);

  useEffect(() => {
    if (!dataSource || dataSource.type !== 'remote' || !dataSource.url) return;

    let isMounted = true;
    setLoading(true);

    fetch(dataSource.url, {
      method: dataSource.method || 'GET',
      headers: dataSource.headers,
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const arrayData = Array.isArray(data) ? data : data.items || data.data || [];
        setRemoteData(arrayData);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [dataSource?.url]);

  // Determine items list
  let itemsToRender: any[] = [];
  if (dataSource) {
    if (dataSource.type === 'local' && Array.isArray(dataSource.data)) {
      itemsToRender = dataSource.data;
    } else if (dataSource.type === 'remote' && remoteData) {
      itemsToRender = remoteData;
    } else if (dataSource.type === 'state') {
      // Demo state filtering
      itemsToRender = (dataSource.data as any[]) || [];
    }
  }

  return (
    <View style={[styles.wrapper, node.style as any]}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={themeTokens.colors.primary} />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load: {error}</Text>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingHorizontal: themeTokens.spacing.lg, gap: itemSpacing },
        ]}
      >
        {/* If using dataSource and itemTemplate */}
        {dataSource && itemTemplate && renderChildNode
          ? itemsToRender.map((item, index) => {
              const itemContext = {
                ...context,
                item,
                index,
              };
              return (
                <View key={item.id ? String(item.id) : `item-${index}`}>
                  {renderChildNode(itemTemplate, itemContext)}
                </View>
              );
            })
          : children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: themeTokens.spacing.xs,
  },
  contentContainer: {
    paddingVertical: themeTokens.spacing.xs,
  },
  loadingContainer: {
    padding: themeTokens.spacing.lg,
    alignItems: 'center',
  },
  errorContainer: {
    padding: themeTokens.spacing.md,
  },
  errorText: {
    color: themeTokens.colors.error,
    fontSize: 12,
  },
});
