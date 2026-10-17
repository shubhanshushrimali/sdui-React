import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSDUIScreen } from '../hooks/useSDUIScreen';
import { render } from '@sdui/react';
import { useUserStore } from '../store/useUserStore';
import { useAppStore } from '../store/useAppStore';
import { palette } from '../theme/tokens';
import homeSchema from '../schemas/home.json';

const FINTECH_PRESET = {
  screenId: "home",
  version: 4,
  metadata: { title: "Crypto & Wealth" },
  root: {
    type: "ScrollView",
    props: { showsIndicators: false },
    style: { backgroundColor: "#070B14" },
    children: [
      { type: "Spacer", props: { size: 16 } },
      {
        type: "HeroBanner",
        props: {
          title: "Total Portfolio, {{user.name}}",
          subtitle: "+$14,290.40 (28.4% this month)",
          badgeText: "📈 Market Bullish",
          ctaText: "Trade Assets",
          backgroundImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80"
        }
      },
      {
        type: "View",
        style: { flexDirection: "row", paddingHorizontal: 16, marginVertical: 8, gap: 12 },
        children: [
          {
            type: "MetricCard",
            props: { label: "Bitcoin Balance", value: "1.42 BTC", change: "4.8%", isPositive: true }
          },
          {
            type: "MetricCard",
            props: { label: "Ethereum Staked", value: "18.5 ETH", change: "8.2%", isPositive: true }
          }
        ]
      },
      {
        type: "SectionHeader",
        props: { title: "Top Yield Vaults", subtitle: "Automated compound interest" }
      },
      {
        type: "HorizontalList",
        props: { itemSpacing: 12 },
        dataSource: {
          type: "local",
          data: [
            { id: "c1", title: "USDC Liquidity Pool", price: "12.4% APY", tag: "STABLE", image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=500&q=80" },
            { id: "c2", title: "Solana Super Stake", price: "7.8% APY", tag: "SOL", image: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=500&q=80" }
          ]
        },
        itemTemplate: {
          type: "ProductCard",
          props: { id: "{{item.id}}", title: "{{item.title}}", price: "{{item.price}}", tag: "{{item.tag}}", image: "{{item.image}}" }
        }
      },
      { type: "Spacer", props: { size: 40 } }
    ]
  }
};

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 640;

  const { screen, loading, error, refresh } = useSDUIScreen('home');
  const user = useUserStore((state) => state.user);
  const togglePremium = useUserStore((state) => state.togglePremium);

  const setLiveCustomSchema = useAppStore((state) => state.setLiveCustomSchema);
  const liveCustomSchema = useAppStore((state) => state.liveCustomSchema);

  const [editorVisible, setEditorVisible] = useState(false);
  const [editorText, setEditorText] = useState(
    liveCustomSchema || JSON.stringify(homeSchema, null, 2)
  );

  const handleApplyCustomSchema = () => {
    try {
      JSON.parse(editorText);
      setLiveCustomSchema(editorText);
      setEditorVisible(false);
      Alert.alert('✅ Applied', 'SDUI screen updated instantly with custom JSON schema!');
    } catch (err: any) {
      Alert.alert('Invalid JSON', err.message);
    }
  };

  const handleResetSchema = () => {
    setLiveCustomSchema(null);
    setEditorText(JSON.stringify(homeSchema, null, 2));
    setEditorVisible(false);
    Alert.alert('Reset', 'Restored default schema.');
  };

  const handleLoadPreset = (preset: any) => {
    setEditorText(JSON.stringify(preset, null, 2));
  };

  return (
    <View style={styles.outerBackground}>
      <StatusBar barStyle="light-content" backgroundColor="#070B14" />

      {/* Responsive Container: Centers and constrains layout on Desktop & Tablet */}
      <View style={[styles.responsiveShell, isLargeScreen && styles.responsiveShellDesktop]}>
        <SafeAreaView style={styles.safeArea}>
          {/* Top Engine Control Bar */}
          <View style={styles.engineBar}>
            <View style={styles.engineLeft}>
              <View style={styles.brandBadge}>
                <Text style={styles.brandBadgeText}>SDUI</Text>
              </View>
              <Text style={styles.engineTitle} numberOfLines={1}>
                {screen?.metadata?.title ?? 'SDUI'}
              </Text>
            </View>

            <View style={styles.engineRight}>
              <TouchableOpacity
                style={[styles.vipPill, user.isPremium && styles.vipPillActive]}
                onPress={togglePremium}
                activeOpacity={0.7}
              >
                <Text style={styles.vipPillText}>
                  {user.isPremium ? '👑 GOLD' : '⚡ FREE'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editorButton}
                onPress={() => setEditorVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.editorButtonText}>{'{ }'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Main SDUI Render Stream */}
          {loading && !screen ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Fetching SDUI Schema...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>Error: {error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={refresh}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : screen ? (
            <View style={styles.viewportWrapper}>
              {render({
                node: screen.root,
                context: { user },
                refreshing: loading,
                onRefresh: refresh,
              })}
              {screen.overlay?.map((node, index) => (
                <React.Fragment key={node.id ?? `overlay-${index}`}>
                  {render({ node, context: { user } })}
                </React.Fragment>
              ))}
            </View>
          ) : null}
        </SafeAreaView>
      </View>

      {/* Live SDUI Schema Editor Modal */}
      <Modal
        visible={editorVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditorVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={[styles.modalInner, isLargeScreen && styles.modalInnerDesktop]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Live SDUI Schema Editor</Text>
                <Text style={styles.modalSubtitle}>Edit JSON to see changes render in real time</Text>
              </View>
              <TouchableOpacity onPress={() => setEditorVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Preset Buttons */}
            <View style={styles.presetsRow}>
              <Text style={styles.presetsLabel}>Presets:</Text>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handleLoadPreset(homeSchema)}
              >
                <Text style={styles.presetChipText}>Catalog</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handleLoadPreset(FINTECH_PRESET)}
              >
                <Text style={styles.presetChipText}>FinTech / Crypto</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.editorInput}
              multiline
              value={editorText}
              onChangeText={setEditorText}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardAppearance="dark"
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.resetButton} onPress={handleResetSchema}>
                <Text style={styles.resetButtonText}>Reset Default</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApplyCustomSchema}>
                <Text style={styles.applyButtonText}>Apply Schema Live 🚀</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerBackground: {
    flex: 1,
    backgroundColor: '#030712', // Deep ambient background on large viewports
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
  engineBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0A0F1D',
    borderBottomWidth: 1,
    borderBottomColor: '#1A2333',
  },
  engineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  brandBadge: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  brandBadgeText: {
    color: '#070B14',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  engineTitle: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  engineRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vipPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  vipPillActive: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderColor: palette.amber400,
  },
  vipPillText: {
    color: palette.white,
    fontSize: 11,
    fontWeight: '800',
  },
  editorButton: {
    backgroundColor: '#1E293B',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  editorButtonText: {
    color: palette.cyan400,
    fontSize: 13,
    fontWeight: '900',
  },
  viewportWrapper: {
    flex: 1,
    position: 'relative',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#070B14',
  },
  modalInner: {
    flex: 1,
  },
  modalInnerDesktop: {
    maxWidth: 680,
    alignSelf: 'center',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  modalTitle: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
  },
  closeButtonText: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '700',
  },
  presetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  presetsLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  presetChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  presetChipText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  editorInput: {
    flex: 1,
    backgroundColor: '#030712',
    color: '#34D399',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    padding: 16,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: palette.white,
    fontWeight: '700',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
