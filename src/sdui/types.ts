/**
 * SDUI Core Types
 *
 * These types define the JSON schema contract between the server
 * and the client. Every screen is described as a tree of SDUINode objects.
 */

// ─── Action Types ──────────────────────────────────────────────────
export type SDUIActionType =
  | 'navigate'
  | 'goBack'
  | 'openUrl'
  | 'apiCall'
  | 'setState'
  | 'showToast'
  | 'showBottomSheet'
  | 'dismiss'
  | 'noop';

export interface SDUIAction {
  type: SDUIActionType;
  payload?: Record<string, unknown>;
}

// ─── Data Source ────────────────────────────────────────────────────
export interface SDUIDataSource {
  type: 'remote' | 'local' | 'state';
  /** URL for remote data sources */
  url?: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  /** Key in zustand store for state-based data sources */
  stateKey?: string;
  /** Local static data */
  data?: unknown[];
}

// ─── Condition ─────────────────────────────────────────────────────
export interface SDUICondition {
  /** Template expression e.g. "{{user.isPremium}}" or "{{items.length > 0}}" */
  expression: string;
  /** Operator for comparison conditions */
  operator?: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'truthy' | 'falsy';
  /** Value to compare against */
  value?: unknown;
}

// ─── Style Types ───────────────────────────────────────────────────
export interface SDUIStyle {
  // Layout
  flex?: number;
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  alignSelf?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  flexWrap?: 'wrap' | 'nowrap';
  gap?: number;

  // Spacing
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  margin?: number;
  marginHorizontal?: number;
  marginVertical?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;

  // Dimensions
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;

  // Background
  backgroundColor?: string;
  opacity?: number;

  // Border
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;

  // Shadow
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;

  // Text
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  color?: string;
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  textDecorationLine?: 'none' | 'underline' | 'line-through';

  // Position
  position?: 'relative' | 'absolute';
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  zIndex?: number;

  // Overflow
  overflow?: 'visible' | 'hidden' | 'scroll';
}

// ─── SDUI Node (the core building block) ───────────────────────────
export interface SDUINode {
  /** Unique identifier for this node (optional, for tracking) */
  id?: string;

  /** Component type — maps to a registered component */
  type: string;

  /** Props to pass to the component */
  props?: Record<string, unknown>;

  /** Inline styles */
  style?: SDUIStyle;

  /** Children nodes (recursive) */
  children?: SDUINode[];

  /** Actions triggered by events (onPress, onLongPress, etc.) */
  actions?: Record<string, SDUIAction>;

  /** Remote or local data source for list-type components */
  dataSource?: SDUIDataSource;

  /** Template for rendering each item from dataSource */
  itemTemplate?: SDUINode;

  /** Conditional rendering */
  condition?: SDUICondition;
  /** Node to render if condition is true */
  ifTrue?: SDUINode;
  /** Node to render if condition is false */
  ifFalse?: SDUINode;
}

// ─── Screen Schema ─────────────────────────────────────────────────
export interface SDUIScreenMetadata {
  title?: string;
  description?: string;
  analytics?: {
    screenName: string;
    [key: string]: unknown;
  };
  cachePolicy?: 'no-cache' | 'cache-first' | 'stale-while-revalidate';
  cacheTTL?: number; // seconds
  transition?: 'slide' | 'fade' | 'modal' | 'none';
}

export interface SDUIScreen {
  /** Unique screen identifier */
  screenId: string;

  /** Schema version for backward compatibility */
  version: number;

  /** Screen-level metadata */
  metadata: SDUIScreenMetadata;

  /** Root component node */
  root: SDUINode;
}

// ─── Template Context ──────────────────────────────────────────────
export interface SDUITemplateContext {
  user?: {
    name?: string;
    email?: string;
    isPremium?: boolean;
    avatar?: string;
    [key: string]: unknown;
  };
  item?: Record<string, unknown>;
  state?: Record<string, unknown>;
  params?: Record<string, unknown>;
  [key: string]: unknown;
}

// ─── Component Registry Types ──────────────────────────────────────
export interface SDUIComponentProps {
  node: SDUINode;
  context: SDUITemplateContext;
  children?: React.ReactNode;
}

export type SDUIComponent = React.ComponentType<SDUIComponentProps>;

export type ComponentRegistry = Map<string, SDUIComponent>;
