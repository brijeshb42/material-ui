// In our repo, type declarations for icons are only added at build time
declare module '@mui/icons-material/*' {
  import SvgIcon from '@mui/material/SvgIcon';

  export default SvgIcon;
}

declare module 'nprogress' {
  const NProgress: {
    start(): void;
    done(): void;
    configure(options: Record<string, unknown>): void;
  };
  export default NProgress;
}

declare module 'react-simple-code-editor' {
  import * as React from 'react';

  interface EditorProps extends Record<string, any> {
    value: string;
    onValueChange: (value: string) => void;
    highlight: (value: string) => string | React.ReactNode;
    tabSize?: number;
    insertSpaces?: boolean;
    ignoreTabKey?: boolean;
    padding?: number | string;
    style?: React.CSSProperties;
    textareaId?: string;
    textareaClassName?: string;
    autoFocus?: boolean;
    disabled?: boolean;
    form?: string;
    maxLength?: number;
    minLength?: number;
    name?: string;
    placeholder?: string;
    readOnly?: boolean;
    required?: boolean;
    onClick?: React.MouseEventHandler;
    onFocus?: React.FocusEventHandler;
    onBlur?: React.FocusEventHandler;
    onKeyUp?: React.KeyboardEventHandler;
    onKeyDown?: React.KeyboardEventHandler;
    preClassName?: string;
  }
  const Editor: React.ComponentType<EditorProps>;
  export default Editor;
}

declare module 'react-runner' {
  import * as React from 'react';

  export interface UseRunnerProps {
    code: string;
    scope?: Record<string, unknown>;
  }
  export function useRunner(props: UseRunnerProps): {
    element: React.ReactNode;
    error: string | null;
  };
}

declare module 'stylis' {
  export function prefixer(
    element: Element,
    index: number,
    children: Element[],
    callback: Function,
  ): void;
  export interface Element {
    type: string;
    props: string | string[];
    value: string;
    children: Element | Element[] | string;
    root: Element | null;
    parent: Element | null;
    line: number;
    column: number;
    length: number;
    return: string;
  }
  export const RULESET: string;
}
