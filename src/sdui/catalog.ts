/**
 * Canonical component names a schema may use.
 * Aliases such as SDUIView are registered separately and do not need fixtures.
 */
export const SDUI_COMPONENT_TYPES = [
  'View',
  'Text',
  'Image',
  'ScrollView',
  'Touchable',
  'Spacer',
  'HeroBanner',
  'SectionHeader',
  'ProductCard',
  'HorizontalList',
  'VerticalList',
  'ChipGroup',
  'MetricCard',
  'UpgradeCTA',
  'PremiumBanner',
  'Button',
  'Header',
  'Card',
  'IconRow',
  'ConditionalRender',
] as const;

export type SDUIComponentType = (typeof SDUI_COMPONENT_TYPES)[number];
