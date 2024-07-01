import React from "react";
import Annotator from "./Annotator";
import { AnnotateTag } from "../types/annotate-types";

export type TextAnnotateProps<T> = {
  content: string;
  value: T[];
  onChange?: (value: T[]) => void;
  handleBeforeChange?: (value: T) => Promise<void>;
  getSpan?: (span: T) => T;
  enabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
};

const TextAnnotate = <T extends AnnotateTag>(props: TextAnnotateProps<T>) => {
  return <Annotator isBlendable={false} enabled={true} {...props} />;
};

export default TextAnnotate;
