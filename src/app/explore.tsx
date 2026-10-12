import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useSDUIScreen } from '../hooks/useSDUIScreen';
import { SDUIRenderer } from '../sdui/SDUIRenderer';
import { themeTokens, palette } from '../theme/tokens';

export default function ExploreScreen() {
  const { screen, loading, error, refresh } = useSDUIScreen('explore');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <Text style={styles.logoBadge}>SDUI</Text>
          <View>
            <Text style={styles.headerTitle}>Architecture & Guide</Text>
            <Text style={styles.headerSubtitle}>v{screen?.version ?? 1} • Interactive Docs</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={refresh}
          activeOpacity={0.7}
        >
          <Text style={styles.refreshBtnText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      {loading && !screen ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={palette.cyan400} />
          <Text style={styles.loadingText}>Loading Explore Schema...</Text>
        </View>
      ) : error ? (
        <ScrollView
          contentContainerStyle={styles.centerContainer}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={palette.cyan400} />}
        >
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : screen ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollBody}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={palette.cyan400} />}
        >
          <SDUIRenderer node={screen.root} />
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: themeTokens.spacing.lg,
    paddingVertical: themeTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    backgroundColor: '#0B0F19',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    backgroundColor: palette.cyan500,
    color: '#0B0F19',
    fontWeight: '900',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: themeTokens.radius.sm,
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: themeTokens.colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  refreshBtn: {
    padding: 6,
  },
  refreshBtnText: {
    fontSize: 16,
  },
  scrollBody: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: themeTokens.spacing.xl,
  },
  loadingText: {
    color: themeTokens.colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
  errorText: {
    color: themeTokens.colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: palette.primary600,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: themeTokens.radius.md,
  },
  retryButtonText: {
    color: palette.white,
    fontWeight: '700',
  },
});
