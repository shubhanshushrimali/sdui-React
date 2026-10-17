import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { SDUIComponentProps, SDUINode } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';
import { resolveListItems } from '../../sdui/resolveListItems';
import { themeTokens } from '../../theme/tokens';
import { selectSDUIValue, useAppStore } from '../../store/useAppStore';

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

  const [remote, setRemote] = useState<{ url: string; data: unknown[] } | null>(null);
  const [failure, setFailure] = useState<{ url: string; message: string } | null>(null);

  const stateKey = dataSource?.type === 'state' ? dataSource.stateKey : undefined;
  const stateValue = useAppStore((state) => selectSDUIValue(state, stateKey));

  const remoteUrl = dataSource?.type === 'remote' ? dataSource.url : undefined;
  const remoteMethod = dataSource?.type === 'remote' ? dataSource.method : undefined;

  useEffect(() => {
    if (!remoteUrl) return;
    const controller = new AbortController();

    fetch(remoteUrl, {
      method: remoteMethod || 'GET',
      headers: dataSource?.headers,
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        const arrayData = Array.isArray(data) ? data : data.items || data.data || [];
        setRemote({ url: remoteUrl, data: arrayData });
        setFailure(null);
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return;
        setFailure({ url: remoteUrl, message: err.message });
      });

    return () => {
      controller.abort();
    };
  }, [remoteUrl, remoteMethod, dataSource?.headers]);

  const remoteData = remote && remote.url === remoteUrl ? remote.data : null;
  const loading = Boolean(remoteUrl) && remote?.url !== remoteUrl && failure?.url !== remoteUrl;
  const error = failure && failure.url === remoteUrl ? failure.message : null;

  const itemsToRender = resolveListItems(dataSource, stateValue, remoteData);
  const filteredEmpty =
    dataSource?.type === 'state' &&
    !loading &&
    itemsToRender.length === 0 &&
    (Array.isArray(dataSource.data) ? dataSource.data.length > 0 : !Array.isArray(stateValue));

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

      {filteredEmpty && (
        <Text style={styles.emptyText}>Nothing matches this filter.</Text>
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
              const record = item && typeof item === 'object' ? (item as Record<string, unknown>) : null;
              const itemContext = {
                ...context,
                item,
                index,
              };
              return (
                <View key={record?.id != null ? String(record.id) : `item-${index}`}>
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
  emptyText: {
    color: themeTokens.colors.textMuted,
    fontSize: 13,
    paddingHorizontal: themeTokens.spacing.lg,
    paddingVertical: themeTokens.spacing.md,
  },
});
