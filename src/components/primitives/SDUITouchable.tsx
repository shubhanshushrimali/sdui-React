import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { createActionHandler } from '../../sdui/ActionDispatcher';
import { resolveProps } from '../../sdui/TemplateResolver';

export const SDUITouchable: React.FC<SDUIComponentProps> = ({ node, context, children }) => {
  const resolvedProps = resolveProps(node.props, context);
  const style = (node.style || {}) as ViewStyle;

  const onPressAction = node.actions?.onPress;
  const onLongPressAction = node.actions?.onLongPress;

  const handlePress = createActionHandler(onPressAction, context);
  const handleLongPress = createActionHandler(onLongPressAction, context);

  return (
    <TouchableOpacity
      activeOpacity={Number(resolvedProps.activeOpacity ?? 0.75)}
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={[styles.default, style]}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  default: {
    // base touchable style
  },
});
