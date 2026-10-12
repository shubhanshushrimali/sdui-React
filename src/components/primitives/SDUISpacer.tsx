import React from 'react';
import { View } from 'react-native';
import { SDUIComponentProps } from '../../sdui/types';
import { resolveProps } from '../../sdui/TemplateResolver';

export const SDUISpacer: React.FC<SDUIComponentProps> = ({ node, context }) => {
  const resolvedProps = resolveProps(node.props, context);
  const size = Number(resolvedProps.size ?? node.style?.height ?? 16);
  const horizontal = Boolean(resolvedProps.horizontal);

  return (
    <View
      style={{
        width: horizontal ? size : undefined,
        height: !horizontal ? size : undefined,
      }}
    />
  );
};
