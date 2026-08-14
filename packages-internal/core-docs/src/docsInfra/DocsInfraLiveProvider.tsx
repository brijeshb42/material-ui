import * as React from 'react';
import { LiveDemoProvider } from '@mui/internal-docs-infra/LiveDemoProvider';

export interface DemoScope {
  /** Top-level identifiers the runner binds, as emitted by the Markdown loader. */
  process: {};
  /** Modules the demo's imports resolve against, keyed by specifier. */
  import: Record<string, unknown>;
}

export interface DocsInfraLiveProviderProps {
  /** The loader's `demos.scope`, which already holds real modules. */
  scope: DemoScope;
  children: React.ReactNode;
}

/**
 * Makes a migrated demo live.
 *
 * The provider owns the controlled source and builds each edited variant;
 * `useCode` below reads both from it directly, so no highlighter is mounted and
 * Material keeps rendering the source panel, the editor, and the toolbar itself.
 */
export function DocsInfraLiveProvider(props: DocsInfraLiveProviderProps) {
  const { scope, children } = props;

  const globals = React.useMemo(() => ({ process: scope.process }), [scope.process]);

  return (
    <LiveDemoProvider externals={scope.import} globals={globals}>
      {children}
    </LiveDemoProvider>
  );
}
