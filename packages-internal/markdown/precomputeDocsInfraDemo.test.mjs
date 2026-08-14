import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { expect } from 'chai';
import precomputeDocsInfraDemo from './precomputeDocsInfraDemo.mjs';

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const fixture = path.join(fixtureDir, 'docsInfraDemo/DemoFixture.js');
const typescriptFixture = path.join(fixtureDir, 'docsInfraDemo/DemoFixture.tsx');
const jsOnlyFixture = path.join(fixtureDir, 'docsInfraDemoJsOnly/JsOnlyFixture.js');

describe('precomputeDocsInfraDemo', () => {
  it('loads the entry source exactly as committed', async () => {
    const result = await precomputeDocsInfraDemo({
      demoName: 'DemoFixture.js',
      moduleFilepath: fixture,
    });

    expect(result.variants.JS.source).to.equal(await fs.readFile(fixture, { encoding: 'utf8' }));
    expect(result.variants.JS.fileName).to.equal('DemoFixture.js');
  });

  it('loads the TypeScript sibling as a second variant', async () => {
    const result = await precomputeDocsInfraDemo({
      demoName: 'DemoFixture.js',
      moduleFilepath: fixture,
    });

    expect(result.variants.TS.source).to.equal(
      await fs.readFile(typescriptFixture, { encoding: 'utf8' }),
    );
    expect(result.variants.TS.fileName).to.equal('DemoFixture.tsx');
  });

  it('highlights JSX in the JavaScript variant', async () => {
    const result = await precomputeDocsInfraDemo({
      demoName: 'DemoFixture.js',
      moduleFilepath: fixture,
    });

    // Without the JSX grammar the element and attribute names are left
    // unclassified, so the JavaScript variant would lose the colours its
    // TypeScript sibling keeps.
    expect(result.variants.JS.html).to.include('di-jsx');
    expect(result.variants.JS.html).to.include('di-ak');
  });

  it('classifies both variants the same way', async () => {
    const result = await precomputeDocsInfraDemo({
      demoName: 'DemoFixture.js',
      moduleFilepath: fixture,
    });

    const classNames = (html) =>
      [...new Set([...html.matchAll(/class="([^"]+)"/g)].flatMap((match) => match[1].split(' ')))]
        .sort()
        .join(' ');

    expect(classNames(result.variants.JS.html)).to.equal(classNames(result.variants.TS.html));
  });

  it('omits the TypeScript variant when no sibling exists', async () => {
    const result = await precomputeDocsInfraDemo({
      demoName: 'JsOnlyFixture.js',
      moduleFilepath: jsOnlyFixture,
    });

    expect(result.variants).to.have.keys(['JS']);
  });

  it('collects the external imports of the demo', async () => {
    const result = await precomputeDocsInfraDemo({
      demoName: 'DemoFixture.js',
      moduleFilepath: fixture,
    });

    expect(Object.keys(result.externals)).to.deep.equal(['@mui/material/Button']);
  });

  it('reports both variants as dependencies', async () => {
    const result = await precomputeDocsInfraDemo({
      demoName: 'DemoFixture.js',
      moduleFilepath: fixture,
    });

    expect(result.dependencies.map((url) => fileURLToPath(url))).to.have.members([
      fixture,
      typescriptFixture,
    ]);
  });
});
