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

// Conditional
import { ConditionalRender } from '../components/conditional/ConditionalRender';

class ComponentRegistryManager {
  private registry = new Map<string, SDUIComponent>();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    // Primitives
    this.register('View', SDUIView);
    this.register('SDUIView', SDUIView);
    this.register('Text', SDUIText);
    this.register('SDUIText', SDUIText);
    this.register('Image', SDUIImage);
    this.register('SDUIImage', SDUIImage);
    this.register('ScrollView', SDUIScrollView);
    this.register('SDUIScrollView', SDUIScrollView);
    this.register('Touchable', SDUITouchable);
    this.register('SDUITouchable', SDUITouchable);
    this.register('Spacer', SDUISpacer);
    this.register('SDUISpacer', SDUISpacer);

    // Composites
    this.register('HeroBanner', HeroBanner);
    this.register('SectionHeader', SectionHeader);
    this.register('ProductCard', ProductCard);
    this.register('HorizontalList', HorizontalList as any);
    this.register('VerticalList', VerticalList as any);
    this.register('ChipGroup', ChipGroup);
    this.register('MetricCard', MetricCard);
    this.register('UpgradeCTA', UpgradeCTA);
    this.register('PremiumBanner', PremiumBanner);
    this.register('Button', Button);

    // Conditional
    this.register('ConditionalRender', ConditionalRender as any);
  }

  public register(type: string, component: SDUIComponent): void {
    this.registry.set(type.toLowerCase(), component);
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
