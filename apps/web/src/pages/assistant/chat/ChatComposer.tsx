import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Send, Square } from "lucide-react";
import type {
  FocusEventHandler,
  KeyboardEvent,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactEventHandler,
  Ref,
} from "react";
import { Button, Input } from "../../../ui";
import { root as inputStyle } from "../../../ui/Input.css";
import * as s from "./chat.css";

type ChatComposerFieldElement = HTMLInputElement | HTMLTextAreaElement;

interface ChatComposerFieldProps {
  autoFocus?: boolean;
  onFocus?: FocusEventHandler<ChatComposerFieldElement>;
  onBlur?: FocusEventHandler<ChatComposerFieldElement>;
  onKeyUp?: KeyboardEventHandler<ChatComposerFieldElement>;
  onClick?: MouseEventHandler<ChatComposerFieldElement>;
  onSelect?: ReactEventHandler<ChatComposerFieldElement>;
}

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  busy: boolean;
  aborting: boolean;
  disabled?: boolean;
  allowInputWhileBusy?: boolean;
  multiline?: boolean;
  textareaRef?: Ref<HTMLTextAreaElement>;
  placeholder: string;
  onSubmit: (value: string) => void;
  onAbort: () => void;
  hint?: string | null;
  inputProps?: ChatComposerFieldProps;
  onValueDetail?: (value: string, selectionStart: number | null) => void;
  onKeyDownIntercept?: (event: KeyboardEvent<ChatComposerFieldElement>) => boolean;
}

export function ChatComposer({
  value,
  onChange,
  busy,
  aborting,
  disabled,
  allowInputWhileBusy = false,
  multiline = false,
  textareaRef,
  placeholder,
  onSubmit,
  onAbort,
  hint,
  inputProps,
  onValueDetail,
  onKeyDownIntercept,
}: ChatComposerProps) {
  const prefersReducedMotion = useReducedMotion();
  const fieldDisabled = (busy && !allowInputWhileBusy) || disabled;
  const handleKeyDown = (event: KeyboardEvent<ChatComposerFieldElement>) => {
    if (onKeyDownIntercept?.(event)) return;
    if (event.key !== "Enter" || event.nativeEvent.isComposing || (multiline && event.shiftKey)) return;
    event.preventDefault();
    onSubmit(value);
  };

  const fieldProps = {
    autoFocus: inputProps?.autoFocus,
    onFocus: inputProps?.onFocus,
    onBlur: inputProps?.onBlur,
    onKeyUp: inputProps?.onKeyUp,
    onClick: inputProps?.onClick,
    onSelect: inputProps?.onSelect,
  };

  return (
    <>
      <div className={s.composer}>
        {multiline ? (
          <textarea
            ref={textareaRef}
            className={`${inputStyle} ${s.composerField} ${s.composerFieldMultiline}`}
            rows={1}
            aria-label={placeholder}
            autoComplete="off"
            name="message"
            placeholder={placeholder}
            value={value}
            disabled={fieldDisabled}
            onChange={(event) => {
              onChange(event.target.value);
              onValueDetail?.(event.target.value, event.target.selectionStart);
            }}
            onKeyDown={handleKeyDown}
            {...fieldProps}
          />
        ) : (
          <Input
            className={s.composerField}
            aria-label={placeholder}
            autoComplete="off"
            name="message"
            placeholder={placeholder}
            value={value}
            disabled={fieldDisabled}
            onChange={(event) => {
              onChange(event.target.value);
              onValueDetail?.(event.target.value, event.target.selectionStart);
            }}
            onKeyDown={handleKeyDown}
            {...fieldProps}
          />
        )}
        <Button
          accent={!busy}
          className={`${s.composerAction} ${busy ? s.composerActionStop : s.composerActionSend}`}
          aria-label={busy ? "Stop generating" : "Send"}
          disabled={busy ? aborting : !value.trim() || disabled}
          onClick={busy ? onAbort : () => onSubmit(value)}
        >
          {prefersReducedMotion ? (
            <span className={s.composerActionIcon}>
              {busy ? <Square size={12} aria-hidden="true" /> : <Send size={14} aria-hidden="true" />}
            </span>
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={busy ? "stop" : "send"}
                className={s.composerActionIcon}
                initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              >
                {busy ? <Square size={12} aria-hidden="true" /> : <Send size={14} aria-hidden="true" />}
              </motion.span>
            </AnimatePresence>
          )}
        </Button>
      </div>
      {hint && (
        <div className={s.hint} role="alert">
          {hint}
        </div>
      )}
    </>
  );
}
