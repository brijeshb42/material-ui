import type { Externals } from '@mui/internal-docs-infra/CodeHighlighter/types';

export interface PrecomputeDocsInfraDemoOptions {
  /** Demo marker value as written in Markdown. */
  demoName: string;
  /** Absolute path of the demo entry file. */
  moduleFilepath: string;
  /** Contents of the sibling `.tsx.preview` file, when one exists. */
  previewSource?: string;
}

export interface DocsInfraRelativeFile {
  /** Path relative to the variant, used as the tab label. */
  module: string;
  /** File source as loaded by docs-infra. */
  raw: string;
  /** File source highlighted by docs-infra, as HTML. */
  highlightedHtml: string;
}

export interface DocsInfraDemoPreview {
  /** The region of the variant's source that the preview names. */
  source: string;
  /** That region highlighted by docs-infra, as HTML. */
  html: string;
}

export interface DocsInfraDemoVariant {
  /** Variant source as loaded by docs-infra. */
  source: string;
  /** Variant source highlighted by docs-infra, as HTML. */
  html: string;
  /** Displayed file name. */
  fileName: string;
  /** Source language reported by docs-infra. */
  language?: string;
  /** Relative files this variant imports, in the order docs-infra loaded them. */
  relativeFiles: DocsInfraRelativeFile[];
  /**
   * The collapsed preview, when the demo ships a `.tsx.preview` file that
   * docs-infra could resolve against this variant's source.
   */
  preview?: DocsInfraDemoPreview;
}

export interface DocsInfraDemoData {
  /**
   * Processed source keyed by language. `JS` is always present; `TS` only when
   * the demo has a TypeScript sibling. Keys match `CODE_VARIANTS`.
   */
  variants: Record<string, DocsInfraDemoVariant>;
  /** External imports collected from the source graph. */
  externals: Externals;
  /** Source URLs the demo depends on. */
  dependencies: string[];
}

export default function precomputeDocsInfraDemo(
  options: PrecomputeDocsInfraDemoOptions,
): Promise<DocsInfraDemoData>;
