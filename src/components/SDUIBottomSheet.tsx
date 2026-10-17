import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { themeTokens, palette } from '../theme/tokens';

export function SDUIBottomSheet() {
  const sheet = useAppStore((state) => state.bottomSheet);
  const dismissBottomSheet = useAppStore((state) => state.dismissBottomSheet);
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={sheet != null}
      transparent
      animationType="slide"
      onRequestClose={dismissBottomSheet}
    >
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={dismissBottomSheet}
          accessibilityLabel="Dismiss sheet"
        />
        <View
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}
          accessibilityLabel={sheet?.title ?? 'Details'}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>{sheet?.title}</Text>
          {sheet?.message ? <Text style={styles.message}>{sheet.message}</Text> : null}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={dismissBottomSheet}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryLabel}>{sheet?.primaryLabel || 'Done'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheet: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: themeTokens.spacing.xl,
    paddingTop: themeTokens.spacing.md,
    borderTopWidth: 1,
    borderColor: themeTokens.colors.border,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
    marginBottom: themeTokens.spacing.lg,
  },
  title: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '800',
  },
  message: {
    color: themeTokens.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: themeTokens.spacing.sm,
  },
  primaryButton: {
    marginTop: themeTokens.spacing.xl,
    backgroundColor: palette.emerald500,
    borderRadius: themeTokens.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryLabel: {
    color: palette.white,
    fontWeight: '800',
    fontSize: 15,
  },
});
