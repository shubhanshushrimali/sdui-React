import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useSDUIScreen } from '../hooks/useSDUIScreen';
import { SDUIRenderer } from '../sdui/SDUIRenderer';
import { useUserStore } from '../store/useUserStore';
import { useAppStore } from '../store/useAppStore';
import { themeTokens, palette } from '../theme/tokens';
import homeSchema from '../schemas/home.json';

const FINTECH_PRESET = {
  screenId: "home",
  version: 3,
  metadata: { title: "Crypto & Wealth" },
  root: {
    type: "ScrollView",
    props: { showsIndicators: false },
    style: { backgroundColor: "#0B0F19" },
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
      { type: "Spacer", props: { size: 30 } }
    ]
  }
};

export default function HomeScreen() {
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <Text style={styles.logoBadge}>SDUI</Text>
          <View>
            <Text style={styles.headerTitle}>Engine</Text>
            <Text style={styles.headerSubtitle}>v{screen?.version ?? 1} • Server-Driven</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* User Tier Toggle Button */}
          <TouchableOpacity
            style={[styles.tierButton, user.isPremium && styles.tierButtonActive]}
            onPress={togglePremium}
            activeOpacity={0.7}
          >
            <Text style={styles.tierButtonText}>
              {user.isPremium ? '👑 VIP' : '⚡ FREE'}
            </Text>
          </TouchableOpacity>

          {/* JSON Live Editor Button */}
          <TouchableOpacity
            style={styles.editorButton}
            onPress={() => setEditorVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.editorButtonText}>{'{ }'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      {loading && !screen ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={palette.cyan400} />
          <Text style={styles.loadingText}>Fetching SDUI Schema...</Text>
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

      {/* Live SDUI Schema Editor Modal */}
      <Modal
        visible={editorVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditorVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
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
              <Text style={styles.presetChipText}>E-Commerce</Text>
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
        </SafeAreaView>
      </Modal>
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
    backgroundColor: palette.primary600,
    color: palette.white,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: themeTokens.radius.full,
  },
  tierButtonActive: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    borderColor: palette.emerald400,
  },
  tierButtonText: {
    color: palette.white,
    fontSize: 11,
    fontWeight: '700',
  },
  editorButton: {
    backgroundColor: '#1F2937',
    width: 34,
    height: 34,
    borderRadius: themeTokens.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  editorButtonText: {
    color: palette.cyan400,
    fontSize: 14,
    fontWeight: '800',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: themeTokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  modalTitle: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: themeTokens.colors.textMuted,
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
    paddingHorizontal: themeTokens.spacing.lg,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  presetsLabel: {
    color: themeTokens.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  presetChip: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: themeTokens.radius.full,
    borderWidth: 1,
    borderColor: '#374151',
  },
  presetChipText: {
    color: palette.cyan400,
    fontSize: 11,
    fontWeight: '700',
  },
  editorInput: {
    flex: 1,
    backgroundColor: '#070A10',
    color: '#34D399',
    fontFamily: 'monospace',
    fontSize: 12,
    padding: 16,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: themeTokens.spacing.lg,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#1F2937',
    paddingVertical: 14,
    borderRadius: themeTokens.radius.md,
    alignItems: 'center',
  },
  resetButtonText: {
    color: palette.white,
    fontWeight: '700',
  },
  applyButton: {
    flex: 2,
    backgroundColor: palette.primary600,
    paddingVertical: 14,
    borderRadius: themeTokens.radius.md,
    alignItems: 'center',
  },
  applyButtonText: {
    color: palette.white,
    fontWeight: '800',
  },
});
