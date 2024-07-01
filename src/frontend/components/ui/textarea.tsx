import * as React from "react"

import { cn } from "@/frontend/lib/utils"

import { Button } from "./button"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-slate-200 border-slate-200 bg-transparent px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:border-slate-800 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-800",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export interface TextareaWithSaveProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    onSave?: (value?: string) => void;
    rows?: number;
  }

const TextareaWithSave = React.forwardRef<HTMLTextAreaElement, TextareaWithSaveProps>(
  ({ className, onSave, ...props }, ref) => {
    const [hasChanged, setHasChanged] = React.useState(false);
    const [value, setValue] = React.useState(props.defaultValue);

    const handleSave = () => {
      onSave?.(value as string);
      setHasChanged(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
      setHasChanged(true);
    };

    return (
      <div className="relative">
        <Textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:border-slate-800 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-800",
            className
          )}
          rows={props.rows || 5}
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        {hasChanged ? (
          <Button 
            onClick={handleSave}
            className="absolute right-2 top-2 animate-in fade-in zoom-in-60"
          >
            Save
          </Button>
        ) : null}
      </div>
    )
  }
)
TextareaWithSave.displayName = "TextareaWithSave"

export { Textarea, TextareaWithSave }
