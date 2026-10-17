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
  useWindowDimensions,
} from 'react-native';
import { useSDUIScreen } from '../hooks/useSDUIScreen';
import { render } from '@sdui/react';
import { useUserStore } from '../store/useUserStore';
import { palette } from '../theme/tokens';

export default function ExploreScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 640;

  const { screen, loading, error, refresh } = useSDUIScreen('explore');
  const user = useUserStore((state) => state.user);

  return (
    <View style={styles.outerBackground}>
      <StatusBar barStyle="light-content" backgroundColor="#070B14" />

      {/* Responsive Container for Tablets & Desktops */}
      <View style={[styles.responsiveShell, isLargeScreen && styles.responsiveShellDesktop]}>
        <SafeAreaView style={styles.safeArea}>
          {/* Top Header Bar */}
          <View style={styles.headerBar}>
            <View style={styles.headerLeft}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoBadgeText}>SDUI</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>{screen?.metadata?.title ?? 'Explore'}</Text>
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
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Loading Explore Schema...</Text>
            </View>
          ) : error ? (
            <ScrollView
              contentContainerStyle={styles.centerContainer}
              refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#10B981" />}
            >
              <Text style={styles.errorText}>Error: {error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={refresh}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : screen ? (
            <View style={styles.scrollBody}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollFill}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#10B981" />}
              >
                {render({ node: screen.root, context: { user } })}
              </ScrollView>
              {screen.overlay?.map((node, index) => (
                <React.Fragment key={node.id ?? `overlay-${index}`}>
                  {render({ node, context: { user } })}
                </React.Fragment>
              ))}
            </View>
          ) : null}
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerBackground: {
    flex: 1,
    backgroundColor: '#030712',
  },
  responsiveShell: {
    flex: 1,
    width: '100%',
    backgroundColor: '#070B14',
  },
  responsiveShellDesktop: {
    maxWidth: 540,
    alignSelf: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#070B14',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2333',
    backgroundColor: '#0A0F1D',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  logoBadgeText: {
    color: '#070B14',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: '#94A3B8',
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
    position: 'relative',
    backgroundColor: '#070B14',
  },
  scrollFill: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
  errorText: {
    color: palette.rose500,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
