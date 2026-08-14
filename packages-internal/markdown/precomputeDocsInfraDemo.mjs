// @ts-check

import path from 'path';
import { promises as fs } from 'fs';
import { pathToFileURL } from 'url';
import { precomputeFileDemo } from '@mui/internal-docs-infra/pipeline/precomputeFileDemo';
import { getHastTextContent } from '@mui/internal-docs-infra/pipeline/hastUtils';
import { toHtml } from 'hast-util-to-html';

/**
 * Builds one docs-infra entry per language.
 *
 * Markers name the JavaScript file, but the TypeScript sibling is the source
 * demos are written in, so both are loaded when it exists. Demos with no
 * sibling stay JavaScript-only.
 *
 * @param {string} moduleFilepath
 * @returns {Promise<Record<string, import('@mui/internal-docs-infra/pipeline/precomputeDemo').DemoEntry>>}
 */
async function resolveEntries(moduleFilepath) {
  const fileName = path.basename(moduleFilepath);
  const entries = {
    // Demos keep JSX in their `.js` files, which the plain JavaScript grammar
    // does not highlight.
    JS: { name: 'JS', url: pathToFileURL(moduleFilepath).href, fileName, language: 'jsx' },
  };

  const typescriptFilepath = moduleFilepath.replace(/\.js$/, '.tsx');
  if (typescriptFilepath === moduleFilepath) {
    return entries;
  }

  try {
    await fs.access(typescriptFilepath);
  } catch (error) {
    return entries;
  }

  return {
    ...entries,
    TS: {
      name: 'TS',
      url: pathToFileURL(typescriptFilepath).href,
      fileName: path.basename(typescriptFilepath),
    },
  };
}

/**
 * Reads one processed variant off the docs-infra result.
 *
 * @param {import('@mui/internal-docs-infra/CodeHighlighter/types').Code} code
 * @param {string} variantName
 * @param {string} demoName
 * @returns {import('./precomputeDocsInfraDemo.mjs').DocsInfraDemoVariant}
 */
function readVariant(code, variantName, demoName) {
  const variant = code[variantName];
  if (typeof variant === 'string' || !variant) {
    throw new Error(`docs-infra returned no ${variantName} source for the demo "${demoName}"`);
  }

  // `output: 'hast'` below, so the source is a HAST root rather than a string
  // or one of the serialized forms.
  const { source } = variant;
  if (!source || typeof source === 'string' || !('type' in source) || source.type !== 'root') {
    throw new Error(
      `docs-infra returned no highlighted ${variantName} source for the demo "${demoName}"`,
    );
  }

  return {
    source: getHastTextContent(source),
    html: toHtml(source),
    fileName: variant.fileName ?? '',
    language: variant.language,
  };
}

/**
 * Builds the docs-infra source graph for one demo marker.
 *
 * This is the only build-time module allowed to import docs-infra. It returns
 * serializable data so the Markdown loader can inline it next to the legacy
 * demo data.
 *
 * @param {import('./precomputeDocsInfraDemo.mjs').PrecomputeDocsInfraDemoOptions} options
 * @returns {Promise<import('./precomputeDocsInfraDemo.mjs').DocsInfraDemoData>}
 */
export default async function precomputeDocsInfraDemo(options) {
  const { demoName, moduleFilepath, previewSource } = options;
  const name = path.basename(moduleFilepath).replace(/\.[^.]+$/, '');
  const entries = await resolveEntries(moduleFilepath);

  const precomputed = await precomputeFileDemo(
    {
      name,
      slug: demoName,
      entries,
      ...(previewSource
        ? { preview: { source: previewSource, fileName: `${name}.tsx.preview` } }
        : {}),
    },
    { output: 'hast' },
  );

  const variants = Object.fromEntries(
    Object.keys(entries).map((variantName) => [
      variantName,
      readVariant(precomputed.code, variantName, demoName),
    ]),
  );

  return {
    variants,
    externals: precomputed.externals,
    dependencies: precomputed.dependencies,
  };
}
