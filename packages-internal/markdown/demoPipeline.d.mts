/**
 * Capabilities that a demo can opt into while docs-infra is being introduced.
 * Every flag is off until the matching docs-infra API is verified.
 */
export interface DocsInfraDemoFlags {
  source: boolean;
  liveEdit: boolean;
  languageVariants: boolean;
  /**
   * Reads the displayed source from docs-infra's headless `useCode` at runtime
   * rather than from the strings the loader precomputed. Highlighted markup
   * still comes from the precompute.
   */
  headlessSource: boolean;
}

export type DemoPipeline = 'legacy' | 'docs-infra';

/**
 * Demo marker as authored in Markdown, for example
 * `{{"demo": "BasicButtons.js", "docsInfra": true}}`.
 */
export interface DemoMarker {
  demo: string;
  /** Renders this demo through docs-infra instead of the legacy pipeline. */
  docsInfra?: boolean;
  [option: string]: unknown;
}

export const docsInfraDemoFlags: DocsInfraDemoFlags;

export function shouldUseDocsInfraPipeline(marker: DemoMarker): DemoPipeline;

export function resolveDocsInfraDemoFlags(marker: DemoMarker): DocsInfraDemoFlags;
