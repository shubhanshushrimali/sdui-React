import React from 'react';
import { SDUIComponentProps, SDUINode } from '../../sdui/types';
import { evaluateCondition } from '../../sdui/ConditionalEvaluator';

interface ConditionalRenderProps extends SDUIComponentProps {
  renderChildNode?: (node: SDUINode, context: any) => React.ReactNode;
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  node,
  context,
  renderChildNode,
}) => {
  if (!node.condition || !renderChildNode) {
    return null;
  }

  const isConditionMet = evaluateCondition(node.condition, context);

  if (isConditionMet && node.ifTrue) {
    return <>{renderChildNode(node.ifTrue, context)}</>;
  }

  if (!isConditionMet && node.ifFalse) {
    return <>{renderChildNode(node.ifFalse, context)}</>;
  }

  return null;
};
