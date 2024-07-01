import React from "react";
import { luminTest } from "./utils/utils";
import { MarkedSpan } from "../types/annotate-types";
import { cn } from "@/frontend/lib/utils";

export interface MarkProps<T> {
  key: string;
  content: string;
  start: number;
  end: number;
  onClick: (arg: T) => void;
  tag?: string;
  color?: string;
  className?: string;
  index?: number;
}

const Mark = <T extends MarkedSpan>({
  color,
  className,
  end,
  start,
  onClick,
  content,
  tag,
}: MarkProps<T>) => {
  // const lumin = color ? luminTest(color) : false;

  return (
    <mark
      className={cn(
        className, 
        "rounded-lg px-3 py-1 mx-1 text-sm group relative",
        `bg-slate-900 font-bold text-slate-100 border-b-4`
      )}
      style={{
        // backgroundColor: color || "#84d2ff",
        borderColor: color || "#84d2ff",
        cursor: "pointer",
        position: "relative",
        // ...(lumin && { color: "white" }),
      }}
      data-start={start}
      data-end={end}
      onMouseUp={() => onClick({ start: start, end: end } as T)}
    >
      {content}
      {tag && (
        <span className="absolute left-0 -top-5 text-black bg-neutral-50 hidden group-hover:inline px-2 rounded-lg text-xs font-sans">
          {tag}
        </span>
      )}
    </mark>
  );
};

export default Mark;
