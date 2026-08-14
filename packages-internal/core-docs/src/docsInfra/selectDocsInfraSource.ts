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
  module: string;
  moduleTS?: string;
  highlightedHtml?: string;
  relativeModules?: Record<
    string,
    Array<{ module: string; raw: string; highlightedHtml?: string }>
  >;
}

export interface DocsInfraSourceSelection extends DocsInfraSourceOverrides {
  /** File that supplies the source currently on show. */
  selectedFileName?: string;
}

function toModule(fileName: string) {
  return fileName.startsWith('.') ? fileName : `./${fileName}`;
}

export function replaceDemoFileName(location: string, fileName: string) {
  return location.replace(/[^/]+$/, fileName);
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
): DocsInfraSourceSelection {
  const { languageVariants, codeVariant, hasLegacyTypescript } = options;
  const javascript = variants[CODE_VARIANTS.JS];
  const typescript = languageVariants ? variants[CODE_VARIANTS.TS] : undefined;
  const showsTypescript =
    codeVariant === CODE_VARIANTS.TS && Boolean(typescript || hasLegacyTypescript);
  const selectedVariant = showsTypescript ? typescript : javascript;

  // Each language reaches its own relative files, so the tabs are keyed by
  // language the same way the loader keys its own.
  const relativeModules: DocsInfraSourceOverrides['relativeModules'] = {};
  if (javascript.relativeFiles.length > 0) {
    relativeModules[CODE_VARIANTS.JS] = javascript.relativeFiles;
  }
  if (typescript && typescript.relativeFiles.length > 0) {
    relativeModules[CODE_VARIANTS.TS] = typescript.relativeFiles;
  }

  return {
    raw: javascript.source,
    ...(typescript ? { rawTS: typescript.source } : {}),
    module: toModule(javascript.fileName),
    ...(typescript ? { moduleTS: toModule(typescript.fileName) } : {}),
    highlightedHtml: showsTypescript ? typescript?.html : javascript.html,
    ...(Object.keys(relativeModules).length > 0 ? { relativeModules } : {}),
    ...(selectedVariant ? { selectedFileName: selectedVariant.fileName } : {}),
  };
}
