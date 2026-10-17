import { createElement } from 'react';

function host(name) {
  return function Component(props) {
    return createElement(name, props, props?.children);
  };
}

export const View = host('View');
export const Text = host('Text');
export const Image = host('Image');
export const ImageBackground = host('ImageBackground');
export const ScrollView = host('ScrollView');
export const FlatList = host('FlatList');
export const TouchableOpacity = host('TouchableOpacity');
export const ActivityIndicator = host('ActivityIndicator');
export const RefreshControl = host('RefreshControl');
export const Pressable = host('Pressable');
export const Modal = host('Modal');

export const StyleSheet = {
  create: (styles) => styles,
  absoluteFill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  hairlineWidth: 1,
  flatten: (style) => style,
};

export const Alert = { alert() {} };
export const Linking = { openURL: async () => {} };
export const Platform = { OS: 'web', select: (specifics) => specifics.web ?? specifics.default };
export const useColorScheme = () => 'light';
export const useWindowDimensions = () => ({ width: 390, height: 844, scale: 2, fontScale: 1 });
