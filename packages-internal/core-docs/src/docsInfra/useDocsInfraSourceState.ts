import * as React from 'react';
import { useCode } from '@mui/internal-docs-infra/useCode';
import { useControlledCode } from '@mui/internal-docs-infra/CodeControllerContext';
import type { Code } from '@mui/internal-docs-infra/CodeHighlighter/types';
import { CODE_VARIANTS } from '../constants/constants';
import type { DocsInfraSourceSelection } from './selectDocsInfraSource';

export interface UseDocsInfraSourceStateOptions {
  /** Demo slug, used by docs-infra for file hashes and permalinks. */
  slug: string;
  /** Language the reader has selected, one of `CODE_VARIANTS`. */
  codeVariant: string;
  /** Whether the JS/TS toggle reads docs-infra rather than the loader's siblings. */
  languageVariants: boolean;
}

export interface DocsInfraSourceState {
  /** Source of the variant on show, as docs-infra holds it. */
  raw: string;
  /** Collapsed preview region for that variant, when it resolved one. */
  jsxPreview?: string;
  /** File that supplies the source on show. */
  selectedFileName?: string;
  /** Whether docs-infra would accept an edit right now. */
  editable: boolean;
  /**
   * Hands an edit to docs-infra, which rebuilds the variant and publishes a new
   * preview. `undefined` where editing is not wired up.
   *
   * While the panel shows the collapsed preview, `source` is only that region,
   * so it is patched back into the complete file first — a fragment on its own
   * has no imports and would not run.
   */
  setSource?: (source: string, isPreview?: boolean) => void;
  /**
   * docs-infra's live preview for the variant on show, once it has built one.
   * `undefined` before the reader's first edit, so the host keeps rendering its
   * bundled component.
   */
  liveElement?: React.ReactNode;
  /** The variant's runtime error, as reported by docs-infra's runner. */
  error?: string | null;
  /** Discards the reader's edits, restoring the build-time source. */
  reset?: () => void;
  /**
   * Tells docs-infra whether the code panel is showing the whole file or the
   * collapsed preview. Crossing that boundary discards the edit, since an edit
   * made through the preview region is not meaningful against the whole file
   * and the other way round.
   */
  setExpanded?: (expanded: boolean) => void;
}

/**
 * Reads a migrated demo's displayed source from docs-infra at runtime.
 *
 * `useCode` runs headless: docs-infra mounts no editor and renders nothing here,
 * so `DemoEditor`, `DemoToolbar`, and `DemoSandbox` keep working unchanged while
 * the source they show comes from the same state the live controller will own.
 * Highlighted markup still comes from the build-time precompute.
 */
export function useDocsInfraSourceState(
  code: Code,
  options: UseDocsInfraSourceStateOptions,
): DocsInfraSourceState {
  const { slug, codeVariant, languageVariants } = options;

  const contentProps = React.useMemo(() => ({ slug, code }), [slug, code]);

  // The reader's language toggle owns the selection; docs-infra follows it.
  const targetVariant =
    languageVariants && codeVariant === CODE_VARIANTS.TS && code[CODE_VARIANTS.TS]
      ? CODE_VARIANTS.TS
      : CODE_VARIANTS.JS;

  const result = useCode(contentProps, {
    editorMode: 'headless',
    initialVariant: targetVariant,
  });

  const { selectedVariant, selectVariant } = result;
  React.useEffect(() => {
    if (selectedVariant !== targetVariant) {
      selectVariant(targetVariant);
    }
  }, [selectedVariant, targetVariant, selectVariant]);

  // Until the effect above commits, the hook still reports the previous
  // variant's source; reading it would flash the other language.
  const settled = selectedVariant === targetVariant;

  // The live preview and its error come from the controller `LiveDemoProvider`
  // installed, keyed by the same variant `useCode` selected.
  const controller = useControlledCode();
  const liveElement = controller?.components?.[targetVariant];
  const error = controller?.errors?.[targetVariant] ?? null;

  const { setSource, setProjectedSource } = result;
  const handleSetSource = React.useCallback(
    (source: string, isPreview?: boolean) => {
      // While collapsed the editor holds only the preview region, which
      // docs-infra patches back into the file — a fragment on its own has no
      // imports and would not run.
      if (isPreview) {
        setProjectedSource?.(source);
        return;
      }
      setSource?.(source);
    },
    [setSource, setProjectedSource],
  );

  return {
    reset: result.reset,
    setExpanded: result.setExpanded,
    raw: (settled && result.selectedFileSource) || '',
    jsxPreview: settled ? result.selectedFileProjection?.source : undefined,
    selectedFileName: settled ? result.selectedFileName : undefined,
    editable: result.selectedFileEditable,
    setSource: setSource ? handleSetSource : undefined,
    liveElement,
    error,
  };
}

/**
 * Lets the runtime source win over the strings the loader precomputed.
 *
 * The precomputed entry supplies everything the runtime state does not carry
 * yet — highlighted markup, relative files, the other language's source — and
 * covers the render before docs-infra has settled on a variant, so a server
 * render and the first client render agree.
 */
export function mergeDocsInfraSourceState(
  precomputed: DocsInfraSourceSelection,
  state: DocsInfraSourceState,
): DocsInfraSourceSelection {
  return {
    ...precomputed,
    raw: state.raw || precomputed.raw,
    ...(state.jsxPreview ? { jsxPreview: state.jsxPreview } : {}),
    selectedFileName: state.selectedFileName ?? precomputed.selectedFileName,
  };
}
