import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { createActionHandler } from '../../sdui/ActionDispatcher';
import { resolveProps } from '../../sdui/TemplateResolver';
import { schemaStyle } from '../../sdui/style';

export const SDUITouchable: React.FC<SDUIComponentProps> = ({ node, context, children }) => {
  const resolvedProps = resolveProps(node.props, context);
  const style = schemaStyle(node.style);

  const onPressAction = node.actions?.onPress;
  const onLongPressAction = node.actions?.onLongPress;

  const handlePress = createActionHandler(onPressAction, context, node);
  const handleLongPress = createActionHandler(onLongPressAction, context, node);

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
