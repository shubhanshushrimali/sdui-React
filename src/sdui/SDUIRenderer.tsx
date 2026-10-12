import React, { Component, ErrorInfo, ReactNode, useEffect, memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SDUINode, SDUITemplateContext } from './types';
import { componentRegistry } from './ComponentRegistry';
import { evaluateCondition } from './ConditionalEvaluator';
import { useUserStore } from '../store/useUserStore';
import { themeTokens } from '../theme/tokens';

// ─── Error Boundary ───────────────────────────────────────────────
interface ErrorBoundaryProps {
  nodeType: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class SDUIErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[SDUI] Render error in <${this.props.nodeType}>:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (__DEV__) {
        return (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Error rendering &lt;{this.props.nodeType}&gt;</Text>
            <Text style={styles.errorMessage}>{this.state.error?.message}</Text>
          </View>
        );
      }
      return null;
    }
    return this.props.children;
  }
}

// ─── SDUIRenderer ──────────────────────────────────────────────────
export interface SDUIRendererProps {
  node: SDUINode | null | undefined;
  context?: SDUITemplateContext;
}

const SDUIRendererComponent: React.FC<SDUIRendererProps> = ({ node, context }) => {
  const user = useUserStore((state) => state.user);

  const effectiveContext: SDUITemplateContext = {
    user,
    ...context,
  };

  // 1. Impression Analytics Auto-Tracking
  useEffect(() => {
    if (node?.analytics?.impressionEvent) {
      console.log(`📊 [Analytics] Impression: "${node.analytics.impressionEvent}"`, {
        nodeId: node.id,
        nodeType: node.type,
        ...node.analytics.properties,
      });
    }
  }, [node?.id, node?.analytics?.impressionEvent]);

  if (!node) return null;

  // 2. Evaluate node condition
  if (node.condition) {
    const isMet = evaluateCondition(node.condition, effectiveContext);
    if (isMet && node.ifTrue) {
      return <SDUIRenderer node={node.ifTrue} context={effectiveContext} />;
    } else if (!isMet && node.ifFalse) {
      return <SDUIRenderer node={node.ifFalse} context={effectiveContext} />;
    } else if (!isMet) {
      return null;
    }
  }

  // 3. Component Lookup with Fallback Matrix
  let ComponentImpl = componentRegistry.get(node.type);

  // If primary component is unknown, look for fallbackType
  if (!ComponentImpl && node.fallbackType) {
    ComponentImpl = componentRegistry.get(node.fallbackType);
    if (ComponentImpl) {
      console.info(`[SDUI] Degraded <${node.type}> to fallback <${node.fallbackType}>`);
    }
  }

  if (!ComponentImpl) {
    if (__DEV__) {
      return (
        <View style={styles.unknownBox}>
          <Text style={styles.unknownTitle}>[SDUI] Unregistered Component: "{node.type}"</Text>
          <Text style={styles.unknownSubtitle}>
            {node.fallbackType
              ? `Fallback "${node.fallbackType}" was also missing`
              : 'Register this widget in ComponentRegistry.ts'}
          </Text>
        </View>
      );
    }
    return null;
  }

  // 4. List / Template Callback helper
  const renderChildNode = (childNode: SDUINode, itemContext: any) => {
    return <SDUIRenderer node={childNode} context={itemContext} />;
  };

  // 5. Render children recursively
  const renderedChildren = node.children?.map((child, index) => (
    <SDUIRenderer
      key={child.id ? `${child.id}-${index}` : `child-${index}`}
      node={child}
      context={effectiveContext}
    />
  ));

  return (
    <SDUIErrorBoundary nodeType={node.type}>
      <ComponentImpl
        node={node}
        context={effectiveContext}
        {...({ renderChildNode } as any)}
      >
        {renderedChildren}
      </ComponentImpl>
    </SDUIErrorBoundary>
  );
};

export const SDUIRenderer = memo(SDUIRendererComponent);

const styles = StyleSheet.create({
  errorBox: {
    padding: themeTokens.spacing.md,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderColor: themeTokens.colors.error,
    borderWidth: 1,
    borderRadius: themeTokens.radius.md,
    marginVertical: 4,
    marginHorizontal: themeTokens.spacing.lg,
  },
  errorTitle: {
    color: themeTokens.colors.error,
    fontWeight: '700',
    fontSize: 12,
  },
  errorMessage: {
    color: themeTokens.colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  unknownBox: {
    padding: themeTokens.spacing.md,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderColor: themeTokens.colors.warning,
    borderWidth: 1,
    borderRadius: themeTokens.radius.md,
    marginVertical: 4,
    marginHorizontal: themeTokens.spacing.lg,
  },
  unknownTitle: {
    color: themeTokens.colors.warning,
    fontWeight: '700',
    fontSize: 12,
  },
  unknownSubtitle: {
    color: themeTokens.colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
});
