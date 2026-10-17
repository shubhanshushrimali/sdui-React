import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, Text, StyleSheet } from 'react-native';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ flex: 1, height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton icon="🏠">Home</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton icon="🧭">Explore</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({
  children,
  isFocused,
  icon,
  ...props
}: TabTriggerSlotProps & { icon?: string }) {
  return (
    <Pressable {...props} style={styles.tabPressable}>
      <View style={[styles.tabContent, isFocused && styles.tabContentActive]}>
        <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>
          {icon}
        </Text>
        <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View style={styles.tabBarOuter}>
      <View {...props} style={styles.tabBarInner}>
        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarOuter: {
    position: 'fixed' as any,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 998,
    alignItems: 'center',
    pointerEvents: 'box-none' as any,
  },
  tabBarInner: {
    width: '100%',
    maxWidth: 540,
    height: 60,
    backgroundColor: 'rgba(10, 15, 29, 0.96)',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  tabPressable: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  tabContentActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  tabIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#10B981',
    fontWeight: '800',
  },
});
