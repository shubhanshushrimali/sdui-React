import { SDUI_COMPONENT_TYPES, SDUIComponentType } from './catalog';
import { resolveComponentName } from './resolveComponent';
import { SDUIComponent } from './types';

// Primitives
import { SDUIView } from '../components/primitives/SDUIView';
import { SDUIText } from '../components/primitives/SDUIText';
import { SDUIImage } from '../components/primitives/SDUIImage';
import { SDUIScrollView } from '../components/primitives/SDUIScrollView';
import { SDUITouchable } from '../components/primitives/SDUITouchable';
import { SDUISpacer } from '../components/primitives/SDUISpacer';

// Composites
import { HeroBanner } from '../components/composites/HeroBanner';
import { SectionHeader } from '../components/composites/SectionHeader';
import { ProductCard } from '../components/composites/ProductCard';
import { HorizontalList } from '../components/composites/HorizontalList';
import { VerticalList } from '../components/composites/VerticalList';
import { ChipGroup } from '../components/composites/ChipGroup';
import { MetricCard } from '../components/composites/MetricCard';
import { UpgradeCTA } from '../components/composites/UpgradeCTA';
import { PremiumBanner } from '../components/composites/PremiumBanner';
import { Button } from '../components/composites/Button';
import { Header } from '../components/composites/Header';
import { Card } from '../components/composites/Card';
import { IconRow } from '../components/composites/IconRow';

// Conditional
import { ConditionalRender } from '../components/conditional/ConditionalRender';

class ComponentRegistryManager {
  private registry = new Map<string, SDUIComponent>();
  private names = new Set<string>();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    const implementations: Record<SDUIComponentType, SDUIComponent> = {
      View: SDUIView,
      Text: SDUIText,
      Image: SDUIImage,
      ScrollView: SDUIScrollView,
      Touchable: SDUITouchable,
      Spacer: SDUISpacer,
      HeroBanner,
      SectionHeader,
      ProductCard,
      HorizontalList: HorizontalList as SDUIComponent,
      VerticalList: VerticalList as SDUIComponent,
      ChipGroup,
      MetricCard,
      UpgradeCTA,
      PremiumBanner,
      Button,
      Header,
      Card,
      IconRow,
      ConditionalRender: ConditionalRender as SDUIComponent,
    };

    for (const type of SDUI_COMPONENT_TYPES) {
      this.register(type, implementations[type]);
    }

    this.register('SDUIView', SDUIView);
    this.register('SDUIText', SDUIText);
    this.register('SDUIImage', SDUIImage);
    this.register('SDUIScrollView', SDUIScrollView);
    this.register('SDUITouchable', SDUITouchable);
    this.register('SDUISpacer', SDUISpacer);
  }

  public resolve(type: string, fallbackType?: string) {
    const resolved = resolveComponentName((name) => this.has(name), type, fallbackType);
    if (!resolved) return null;
    const component = this.get(resolved.type);
    if (!component) return null;
    return { component, resolvedType: resolved.type, degraded: resolved.degraded };
  }

  public register(type: string, component: SDUIComponent): void {
    this.registry.set(type.toLowerCase(), component);
    this.names.add(type);
  }

  public componentNames(): string[] {
    return [...this.names];
  }

  public get(type: string): SDUIComponent | undefined {
    return this.registry.get(type.toLowerCase());
  }

  public has(type: string): boolean {
    return this.registry.has(type.toLowerCase());
  }

  public getAllRegisteredTypes(): string[] {
    return Array.from(this.registry.keys());
  }
}

export const componentRegistry = new ComponentRegistryManager();
