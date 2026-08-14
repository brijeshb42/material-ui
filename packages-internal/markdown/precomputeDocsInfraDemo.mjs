// @ts-check

import path from 'path';
import { promises as fs } from 'fs';
import { pathToFileURL } from 'url';
import { precomputeFileDemo } from '@mui/internal-docs-infra/pipeline/precomputeFileDemo';
import { getHastTextContent } from '@mui/internal-docs-infra/pipeline/hastUtils';
import { createParseSource } from '@mui/internal-docs-infra/pipeline/parseSource';
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
 * Highlights the preview slice docs-infra resolved for one variant.
 *
 * The slice is highlighted on its own rather than cut out of the variant's
 * markup: it is displayed as a standalone fragment, the way Material highlights
 * a `.tsx.preview` file today.
 *
 * @param {import('@mui/internal-docs-infra/CodeHighlighter/types').VariantCode} variant
 * @param {import('@mui/internal-docs-infra/pipeline/parseSource').ParseSource} parseSource
 * @returns {import('./precomputeDocsInfraDemo.mjs').DocsInfraDemoPreview | undefined}
 */
function readPreview(variant, parseSource) {
  const projection = variant.sourceProjection;
  if (!projection) {
    return undefined;
  }

  const fileName = variant.fileName ?? 'preview.tsx';
  return {
    source: projection.source,
    html: toHtml(parseSource(projection.source, fileName, variant.language)),
  };
}

/**
 * Reads one processed variant off the docs-infra result.
 *
 * @param {import('@mui/internal-docs-infra/CodeHighlighter/types').Code} code
 * @param {string} variantName
 * @param {string} demoName
 * @param {import('@mui/internal-docs-infra/pipeline/parseSource').ParseSource} parseSource
 * @returns {import('./precomputeDocsInfraDemo.mjs').DocsInfraDemoVariant}
 */
function readVariant(code, variantName, demoName, parseSource) {
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

  const preview = readPreview(variant, parseSource);
  return {
    source: getHastTextContent(source),
    html: toHtml(source),
    fileName: variant.fileName ?? '',
    language: variant.language,
    relativeFiles: readRelativeFiles(variant),
    ...(preview ? { preview } : {}),
  };
}

/**
 * Reads the relative files docs-infra loaded alongside one variant.
 *
 * The keys are paths relative to the variant, which the demo displays as tab
 * labels the same way the legacy pipeline displays its module IDs.
 *
 * @param {import('@mui/internal-docs-infra/CodeHighlighter/types').VariantCode} variant
 * @returns {import('./precomputeDocsInfraDemo.mjs').DocsInfraRelativeFile[]}
 */
function readRelativeFiles(variant) {
  return Object.entries(variant.extraFiles ?? {}).flatMap(([fileName, file]) => {
    if (typeof file === 'string' || !file?.source) {
      return [];
    }

    const { source } = file;
    if (typeof source === 'string' || !('type' in source) || source.type !== 'root') {
      return [];
    }

    return [
      {
        module: fileName.startsWith('.') ? fileName : `./${fileName}`,
        raw: getHastTextContent(source),
        highlightedHtml: toHtml(source),
      },
    ];
  });
}

/**
 * Reduces one loaded variant to a serializable `VariantCode` carrying plain
 * text.
 *
 * This is what a headless `useCode` reads on the client. The highlighted markup
 * stays in `variants`, so the text form needs no HAST and stays small. The
 * loader's `url` fields are absolute paths on the build machine, so they are
 * dropped rather than shipped.
 *
 * @param {import('@mui/internal-docs-infra/CodeHighlighter/types').VariantCode} variant
 * @returns {import('@mui/internal-docs-infra/CodeHighlighter/types').VariantCode}
 */
function toTextVariant(variant) {
  const extraFiles = Object.fromEntries(
    Object.entries(variant.extraFiles ?? {}).flatMap(([fileName, file]) => {
      if (typeof file === 'string' || !file?.source) {
        return [];
      }
      const { url: fileUrl, ...rest } = file;
      return [
        [
          fileName,
          typeof rest.source === 'string'
            ? rest
            : { ...rest, source: getHastTextContent(file.source) },
        ],
      ];
    }),
  );

  const { url, ...rest } = variant;
  return {
    ...rest,
    source:
      variant.source && typeof variant.source !== 'string'
        ? getHastTextContent(variant.source)
        : variant.source,
    ...(Object.keys(extraFiles).length > 0 ? { extraFiles } : {}),
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

  const parseSource = await createParseSource();
  const variants = Object.fromEntries(
    Object.keys(entries).map((variantName) => [
      variantName,
      readVariant(precomputed.code, variantName, demoName, parseSource),
    ]),
  );

  const code = Object.fromEntries(
    Object.entries(precomputed.code).flatMap(([variantName, variant]) =>
      typeof variant === 'string' || !variant ? [] : [[variantName, toTextVariant(variant)]],
    ),
  );

  return {
    variants,
    code,
    externals: precomputed.externals,
    dependencies: precomputed.dependencies,
  };
}
