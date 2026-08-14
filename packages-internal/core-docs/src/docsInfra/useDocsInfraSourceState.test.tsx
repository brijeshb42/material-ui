import * as React from 'react';
import { expect } from 'chai';
import { createRenderer, screen } from '@mui/internal-test-utils';
import type { Code } from '@mui/internal-docs-infra/CodeHighlighter/types';
import { CODE_VARIANTS } from '../constants/constants';
import { mergeDocsInfraSourceState, useDocsInfraSourceState } from './useDocsInfraSourceState';

const JS_SOURCE = 'export default function Demo() {\n  return <Stack />;\n}\n';
const TS_SOURCE = 'export default function Demo(): React.JSX.Element {\n  return <Stack />;\n}\n';

const code: Code = {
  [CODE_VARIANTS.JS]: {
    fileName: 'Demo.js',
    source: JS_SOURCE,
    sourceProjection: {
      source: '<Stack />',
      start: JS_SOURCE.indexOf('<Stack />'),
      end: JS_SOURCE.indexOf('<Stack />') + '<Stack />'.length,
    },
  },
  [CODE_VARIANTS.TS]: { fileName: 'Demo.tsx', source: TS_SOURCE },
};

function Probe({
  codeVariant,
  languageVariants = true,
}: {
  codeVariant: string;
  languageVariants?: boolean;
}) {
  const state = useDocsInfraSourceState(code, {
    slug: 'demo',
    codeVariant,
    languageVariants,
  });

  return (
    <React.Fragment>
      <span data-testid="raw">{state.raw}</span>
      <span data-testid="preview">{state.jsxPreview ?? ''}</span>
      <span data-testid="file">{state.selectedFileName ?? ''}</span>
    </React.Fragment>
  );
}

describe('useDocsInfraSourceState', () => {
  const { render } = createRenderer();

  it('reads the JavaScript source and its preview region from docs-infra', () => {
    render(<Probe codeVariant={CODE_VARIANTS.JS} />);

    expect(screen.getByTestId('raw').textContent).to.equal(JS_SOURCE);
    expect(screen.getByTestId('preview').textContent).to.equal('<Stack />');
    expect(screen.getByTestId('file').textContent).to.equal('Demo.js');
  });

  it('follows the reader to the TypeScript variant', () => {
    render(<Probe codeVariant={CODE_VARIANTS.TS} />);

    expect(screen.getByTestId('raw').textContent).to.equal(TS_SOURCE);
    // That variant resolved no preview, so the demo shows the whole file.
    expect(screen.getByTestId('preview').textContent).to.equal('');
    expect(screen.getByTestId('file').textContent).to.equal('Demo.tsx');
  });

  it('stays on JavaScript while the language toggle is off', () => {
    render(<Probe codeVariant={CODE_VARIANTS.TS} languageVariants={false} />);

    expect(screen.getByTestId('raw').textContent).to.equal(JS_SOURCE);
  });
});

describe('mergeDocsInfraSourceState', () => {
  const precomputed = {
    raw: 'PRECOMPUTED',
    rawTS: 'PRECOMPUTED_TS',
    module: './Demo.js',
    highlightedHtml: '<pre>markup</pre>',
    jsxPreview: 'PRECOMPUTED_PREVIEW',
    previewHighlightedHtml: '<pre>preview markup</pre>',
    selectedFileName: 'Precomputed.js',
  };

  it('shows the runtime source rather than the precomputed string', () => {
    const merged = mergeDocsInfraSourceState(precomputed, {
      raw: 'RUNTIME',
      jsxPreview: 'RUNTIME_PREVIEW',
      selectedFileName: 'Runtime.js',
      editable: false,
    });

    expect(merged.raw).to.equal('RUNTIME');
    expect(merged.jsxPreview).to.equal('RUNTIME_PREVIEW');
    expect(merged.selectedFileName).to.equal('Runtime.js');
    // Everything docs-infra's runtime state does not carry yet is untouched.
    expect(merged.highlightedHtml).to.equal('<pre>markup</pre>');
    expect(merged.previewHighlightedHtml).to.equal('<pre>preview markup</pre>');
    expect(merged.rawTS).to.equal('PRECOMPUTED_TS');
  });

  it('falls back to the precomputed strings until the variant settles', () => {
    const merged = mergeDocsInfraSourceState(precomputed, { raw: '', editable: false });

    expect(merged.raw).to.equal('PRECOMPUTED');
    expect(merged.jsxPreview).to.equal('PRECOMPUTED_PREVIEW');
    expect(merged.selectedFileName).to.equal('Precomputed.js');
  });
});
