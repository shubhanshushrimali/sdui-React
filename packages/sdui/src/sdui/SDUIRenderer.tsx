import React, {
  Component,
  ErrorInfo,
  Profiler,
  ProfilerOnRenderCallback,
  ReactNode,
  memo,
  useEffect,
} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SDUINode, SDUITemplateContext } from './types';
import { componentRegistry } from './ComponentRegistry';
import { evaluateCondition } from './ConditionalEvaluator';
import { useEngineStore } from '../state/engineState';
import { themeTokens } from '../theme/tokens';
import { trackSDUIEvent } from './analytics';
import { nodeGuardReason } from './runtime';

interface ErrorBoundaryProps {
  nodeType: string;
  nodeId?: string;
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
    trackSDUIEvent({
      kind: 'boundary',
      name: this.props.nodeType,
      nodeId: this.props.nodeId,
      nodeType: this.props.nodeType,
      properties: { message: error.message },
    });
    if (typeof __DEV__ === 'undefined' || __DEV__) {
      console.error(`[SDUI] Render error in <${this.props.nodeType}>:`, error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (typeof __DEV__ === 'undefined' || __DEV__) {
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

function branchTarget(node: SDUINode, context: SDUITemplateContext): SDUINode | null | 'self' {
  if (!node.condition) return 'self';
  const isMet = evaluateCondition(node.condition, context);
  if (isMet && node.ifTrue) return node.ifTrue;
  if (!isMet && node.ifFalse) return node.ifFalse;
  if (!isMet) return null;
  return 'self';
}

const onRootRender: ProfilerOnRenderCallback = (id, _phase, actualDuration) => {
  trackSDUIEvent({
    kind: 'render',
    name: id,
    nodeType: id,
    durationMs: Math.round(actualDuration),
  });
};

export interface SDUIRendererProps {
  node: SDUINode | null | undefined;
  context?: SDUITemplateContext;
  /** Applied only on this node, not on descendants. */
  refreshing?: boolean;
  onRefresh?: () => void;
  /** The public render() entry checks size caps once. Descendants leave this unset. */
  guard?: boolean;
}

const SDUIRendererComponent: React.FC<SDUIRendererProps> = ({
  node,
  context,
  refreshing,
  onRefresh,
  guard,
}) => {
  const activeCategory = useEngineStore((state) => state.activeCategory);
  const cartCount = useEngineStore((state) => state.cartCount);
  const values = useEngineStore((state) => state.values);

  const effectiveContext: SDUITemplateContext = {
    ...context,
    state: {
      ...(context?.state && typeof context.state === 'object' ? context.state : {}),
      activeCategory,
      cartCount,
      ...values,
    },
  };

  const nodeId = node?.id;
  const nodeType = node?.type;
  const impression = node?.analytics?.impressionEvent;
  const impressionProps = node?.analytics?.properties;
  const guardReason = guard && node ? nodeGuardReason(node) : null;
  const branch = node ? branchTarget(node, effectiveContext) : 'self';
  const rendersSelf = Boolean(node) && !guardReason && branch === 'self';
  const resolved = rendersSelf && node ? componentRegistry.resolve(node.type, node.fallbackType) : null;
  const unknownType = rendersSelf && (!resolved?.component || resolved.degraded) ? nodeType : null;
  const fallbackType = resolved?.degraded ? resolved.resolvedType : undefined;

  useEffect(() => {
    if (!impression || !nodeType) return;
    trackSDUIEvent({
      kind: 'impression',
      name: impression,
      nodeId,
      nodeType,
      properties: impressionProps,
    });
  }, [impression, impressionProps, nodeId, nodeType]);

  useEffect(() => {
    if (!guardReason || !nodeType) return;
    trackSDUIEvent({
      kind: 'validation',
      name: nodeType,
      nodeId,
      nodeType,
      properties: { ok: false, reason: guardReason },
    });
  }, [guardReason, nodeId, nodeType]);

  useEffect(() => {
    if (!unknownType) return;
    trackSDUIEvent({
      kind: 'unknown',
      name: unknownType,
      nodeId,
      nodeType: unknownType,
      properties: fallbackType ? { fallbackType } : undefined,
    });
  }, [fallbackType, nodeId, unknownType]);

  if (!node) return null;

  let body: ReactNode;
  if (guardReason) {
    body = (
      <View style={styles.unknownBox}>
        <Text style={styles.unknownTitle}>Schema blocked</Text>
        <Text style={styles.unknownSubtitle}>{guardReason}</Text>
      </View>
    );
  } else if (branch === null) {
    return null;
  } else if (branch !== 'self') {
    body = <SDUIRenderer node={branch} context={effectiveContext} />;
  } else if (!resolved?.component) {
    if (typeof __DEV__ === 'undefined' || __DEV__) {
      body = (
        <View style={styles.unknownBox}>
          <Text style={styles.unknownTitle}>Unregistered component: {node.type}</Text>
          <Text style={styles.unknownSubtitle}>
            {node.fallbackType
              ? `Fallback ${node.fallbackType} was also missing`
              : 'Register this widget in ComponentRegistry.ts'}
          </Text>
        </View>
      );
    } else {
      return null;
    }
  } else {
    if (resolved.degraded) {
      console.info(`[SDUI] Degraded <${node.type}> to fallback <${resolved.resolvedType}>`);
    }
    const ComponentImpl = resolved.component;
    const renderChildNode = (childNode: SDUINode, itemContext: SDUITemplateContext) => {
      return <SDUIRenderer node={childNode} context={itemContext} />;
    };
    const renderedChildren = node.children?.map((child, index) => (
      <SDUIRenderer
        key={child.id ? `${child.id}-${index}` : `child-${index}`}
        node={child}
        context={effectiveContext}
      />
    ));
    body = (
      <SDUIErrorBoundary nodeType={node.type} nodeId={node.id}>
        <ComponentImpl
          node={node}
          context={effectiveContext}
          refreshing={refreshing}
          onRefresh={onRefresh}
          {...({ renderChildNode } as object)}
        >
          {renderedChildren}
        </ComponentImpl>
      </SDUIErrorBoundary>
    );
  }

  if (!guard) return body;
  return (
    <Profiler id={node.type} onRender={onRootRender}>
      {body}
    </Profiler>
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
