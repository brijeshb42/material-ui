# docs-infra

<p class="description">Demos that exercise the docs-infra migration pipeline.</p>

## Source highlighting

This demo opts in with `"docsInfra": true`, so the Markdown loader
precomputes its source graph with docs-infra and the source below is highlighted
by docs-infra instead of Prism. Every other demo on this page still renders
through the legacy pipeline.

{{"demo": "DemoInDocsDocsInfra.js", "docsInfra": true, "defaultCodeOpen": false, "disableLiveEdit": true}}

## With relative files

This demo imports `notesData`, so it renders one tab per file. The data ships in
each language, and the extensionless import resolves against whichever sibling
matches the language on show: `notesData.js` for JavaScript, `notesData.ts` for
TypeScript. Every file in the tabs is loaded and highlighted by docs-infra.

The data lives under `docs/data` rather than beside the demo because everything
in `docs/pages` is a route, the same arrangement used by the Multiple Tabs demo.

Docs-infra flattens relative files beside the entry point for display, even when
they live elsewhere in the file system.

{{"demo": "DemoInDocsDocsInfraFiles.js", "docsInfra": true, "defaultCodeOpen": false, "disableLiveEdit": true}}
