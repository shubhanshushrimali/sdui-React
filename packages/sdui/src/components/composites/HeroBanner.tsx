import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { schemaStyle } from '../../sdui/style';
import { resolveProps } from '../../sdui/TemplateResolver';
import { createActionHandler } from '../../sdui/ActionDispatcher';
import { themeTokens, palette } from '../../theme/tokens';
import { allowedImageUri } from '../../sdui/runtime';

export const HeroBanner: React.FC<SDUIComponentProps> = ({ node, context }) => {
  const p = resolveProps(node.props, context);
  const title = String(p.title ?? 'Welcome');
  const subtitle = String(p.subtitle ?? '');
  const badgeText = p.badgeText ? String(p.badgeText) : null;
  const ctaText = p.ctaText ? String(p.ctaText) : 'Explore Now';
  const backgroundImage = allowedImageUri(p.backgroundImage);

  const handlePress = createActionHandler(node.actions?.onPress, context, node);
  const handleCta = createActionHandler(node.actions?.onCtaPress || node.actions?.onPress, context, node);

  const content = (
    <View style={styles.inner}>
      {badgeText && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      <TouchableOpacity
        style={styles.ctaButton}
        onPress={handleCta}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaText}>{ctaText}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={[styles.container, schemaStyle(node.style)]}
    >
      {backgroundImage ? (
        <ImageBackground
          source={{ uri: backgroundImage }}
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          <View style={styles.overlay}>{content}</View>
        </ImageBackground>
      ) : (
        <View style={styles.gradientFallback}>{content}</View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: themeTokens.radius.xl,
    overflow: 'hidden',
    marginHorizontal: themeTokens.spacing.lg,
    marginVertical: themeTokens.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  background: {
    width: '100%',
  },
  backgroundImage: {
    borderRadius: themeTokens.radius.xl,
  },
  overlay: {
    padding: themeTokens.spacing.xl,
    backgroundColor: 'rgba(11, 15, 25, 0.75)',
  },
  gradientFallback: {
    padding: themeTokens.spacing.xl,
    backgroundColor: '#1E1B4B', // Indigo-950 rich background
  },
  inner: {
    alignItems: 'flex-start',
  },
  badge: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 1,
    borderColor: palette.primary500,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: themeTokens.radius.full,
    marginBottom: themeTokens.spacing.md,
  },
  badgeText: {
    color: palette.cyan400,
    fontSize: themeTokens.typography.sizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    color: themeTokens.colors.textPrimary,
    fontSize: themeTokens.typography.sizes.xxl,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: themeTokens.spacing.xs,
  },
  subtitle: {
    color: themeTokens.colors.textSecondary,
    fontSize: themeTokens.typography.sizes.sm,
    lineHeight: 20,
    marginBottom: themeTokens.spacing.lg,
  },
  ctaButton: {
    backgroundColor: palette.primary600,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: themeTokens.radius.md,
    shadowColor: palette.primary500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    color: palette.white,
    fontWeight: '700',
    fontSize: themeTokens.typography.sizes.sm,
  },
});
