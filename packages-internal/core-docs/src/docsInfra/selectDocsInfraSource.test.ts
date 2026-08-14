import { expect } from 'chai';
import { CODE_VARIANTS } from '../constants/constants';
import { selectDocsInfraSource } from './selectDocsInfraSource';

const variants = {
  JS: { source: 'js source', html: '<span>js</span>', fileName: 'Demo.js', language: 'jsx' },
  TS: { source: 'ts source', html: '<span>ts</span>', fileName: 'Demo.tsx', language: 'tsx' },
};

const javascriptOnly = { JS: variants.JS };

describe('selectDocsInfraSource', () => {
  it('shows the JavaScript variant when JavaScript is selected', () => {
    expect(
      selectDocsInfraSource(variants, {
        languageVariants: true,
        codeVariant: CODE_VARIANTS.JS,
        hasLegacyTypescript: true,
      }),
    ).to.deep.equal({
      raw: 'js source',
      rawTS: 'ts source',
      highlightedHtml: '<span>js</span>',
    });
  });

  it('shows the TypeScript variant when TypeScript is selected', () => {
    expect(
      selectDocsInfraSource(variants, {
        languageVariants: true,
        codeVariant: CODE_VARIANTS.TS,
        hasLegacyTypescript: true,
      }),
    ).to.deep.equal({
      raw: 'js source',
      rawTS: 'ts source',
      highlightedHtml: '<span>ts</span>',
    });
  });

  it('stays on JavaScript for a demo with no TypeScript sibling', () => {
    expect(
      selectDocsInfraSource(javascriptOnly, {
        languageVariants: true,
        codeVariant: CODE_VARIANTS.TS,
        hasLegacyTypescript: false,
      }),
    ).to.deep.equal({
      raw: 'js source',
      highlightedHtml: '<span>js</span>',
    });
  });

  describe('with language variants disabled', () => {
    it('leaves the TypeScript source to the loader', () => {
      expect(
        selectDocsInfraSource(variants, {
          languageVariants: false,
          codeVariant: CODE_VARIANTS.JS,
          hasLegacyTypescript: true,
        }),
      ).to.deep.equal({
        raw: 'js source',
        highlightedHtml: '<span>js</span>',
      });
    });

    it('drops the markup rather than describing the loader source with it', () => {
      // The demo falls back to the loader's TypeScript sibling here, which
      // docs-infra's JavaScript markup does not describe.
      expect(
        selectDocsInfraSource(variants, {
          languageVariants: false,
          codeVariant: CODE_VARIANTS.TS,
          hasLegacyTypescript: true,
        }),
      ).to.deep.equal({
        raw: 'js source',
        highlightedHtml: undefined,
      });
    });
  });
});
