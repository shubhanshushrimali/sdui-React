import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';
import { useAppStore } from '../../store/useAppStore';
import { palette } from '../../theme/tokens';

export const CategoryStoryCircles: React.FC<SDUIComponentProps> = ({ node, context }) => {
  const p = resolveProps(node.props, context);
  const title = String(p.title ?? "What's on your mind?");
  const categories = (p.categories as Array<{ id: string; label: string; image: string }>) || [
    {
      id: 'biryani',
      label: 'Biryani',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&q=80',
    },
    {
      id: 'pizza',
      label: 'Pizza',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80',
    },
    {
      id: 'burger',
      label: 'Burgers',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80',
    },
    {
      id: 'rolls',
      label: 'Rolls',
      image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200&q=80',
    },
    {
      id: 'dessert',
      label: 'Desserts',
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200&q=80',
    },
    {
      id: 'coffee',
      label: 'Coffee',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=80',
    },
  ];

  const activeCategory = useAppStore((state) => state.activeCategory);
  const setActiveCategory = useAppStore((state) => state.setActiveCategory);

  return (
    <View style={[styles.container, node.style as any]}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.id || activeCategory === cat.label;
          return (
            <TouchableOpacity
              key={cat.id}
              style={styles.circleItem}
              onPress={() => setActiveCategory(cat.label)}
              activeOpacity={0.75}
            >
              <View style={[styles.circleRing, isSelected && styles.circleRingSelected]}>
                <Image source={{ uri: cat.image }} style={styles.image} resizeMode="cover" />
              </View>
              <Text style={[styles.label, isSelected && styles.labelSelected]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  sectionTitle: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  scrollList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  circleItem: {
    alignItems: 'center',
    width: 68,
  },
  circleRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  circleRingSelected: {
    borderColor: '#10B981', // Swiggy green
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  label: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  labelSelected: {
    color: '#34D399',
    fontWeight: '700',
  },
});
