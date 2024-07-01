import React from "react";
import SplitTag from "./SplitTag";
import {
  generalSplitClick,
  generalHandleMouseUp,
  generateSplits,
} from "./utils/annotation-utils";
import { Span, AnnotateTag } from "../types/annotate-types";
import { TextAnnotateProps } from "./TextAnnotate";

export interface AnnotatorProps<T> extends TextAnnotateProps<T> {
  isBlendable: boolean;
}

const TextAnnotator = <T extends AnnotateTag>({
  content,
  value,
  isBlendable,
  onChange,
  handleBeforeChange,
  getSpan,
  style,
  className,
  enabled
}: AnnotatorProps<T>) => {
  const annotateGetSpan = (span: T): T => {
    if (getSpan) return getSpan(span) as T;
    return { start: span.start, end: span.end } as T;
  };

  const decoratedMouseUp = () => {
    return () =>
      generalHandleMouseUp(
        content,
        value,
        isBlendable,
        annotateGetSpan,
        onChange,
        handleBeforeChange
      );
  };

  const decoratedHandleSplitClick = () => {
    return (split: Span) =>
      generalSplitClick(split, value, isBlendable, onChange);
  };

  const handleMouseUp = enabled ? decoratedMouseUp() : () => {};
  const handleSplitClick = enabled ? decoratedHandleSplitClick() : () => {};

  const splits = generateSplits(content, value, isBlendable);

  return (
    <div className={className} style={style} onMouseUp={handleMouseUp}>
      {splits.map((split) => (
        <SplitTag
          key={`${split.start}-${split.end}-${Math.random()}}`}
          {...split}
          onClick={handleSplitClick}
        />
      ))}
    </div>
  );
};

export default TextAnnotator;
