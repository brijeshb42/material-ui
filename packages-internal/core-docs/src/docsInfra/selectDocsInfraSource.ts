import type { DocsInfraDemoData } from '@mui/internal-markdown/precomputeDocsInfraDemo';
import { CODE_VARIANTS } from '../constants/constants';

export interface SelectDocsInfraSourceOptions {
  /** Whether the JS/TS toggle reads docs-infra rather than the loader's siblings. */
  languageVariants: boolean;
  /** Language the reader has selected, one of `CODE_VARIANTS`. */
  codeVariant: string;
  /** Whether the loader found a TypeScript sibling of its own. */
  hasLegacyTypescript: boolean;
}

export interface DocsInfraSourceOverrides {
  raw: string;
  rawTS?: string;
  highlightedHtml?: string;
}

/**
 * Chooses which docs-infra sources override the legacy demo data.
 *
 * The languages are separate variants, so this picks one rather than
 * transforming the other. `highlightedHtml` is only returned when it describes
 * the source the demo will display, otherwise the demo would render one
 * language's highlighting over the other's text.
 */
export function selectDocsInfraSource(
  variants: DocsInfraDemoData['variants'],
  options: SelectDocsInfraSourceOptions,
): DocsInfraSourceOverrides {
  const { languageVariants, codeVariant, hasLegacyTypescript } = options;
  const javascript = variants[CODE_VARIANTS.JS];
  const typescript = languageVariants ? variants[CODE_VARIANTS.TS] : undefined;
  const showsTypescript =
    codeVariant === CODE_VARIANTS.TS && Boolean(typescript || hasLegacyTypescript);

  return {
    raw: javascript.source,
    ...(typescript ? { rawTS: typescript.source } : {}),
    highlightedHtml: showsTypescript ? typescript?.html : javascript.html,
  };
}
