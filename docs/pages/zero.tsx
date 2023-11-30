import * as React from 'react';
import { style } from '@nought/css';
import BrandingCssVarsProvider from 'docs/src/BrandingCssVarsProvider';
import Head from 'docs/src/modules/components/Head';

const h1Class = style({
  color: 'red',
});

export default function Zero() {
  return (
    <BrandingCssVarsProvider>
      <Head
        title="Zero runtime test page - MUI"
        description="MUI is a 100% remote globally distributed team, supported by a community of thousands
        of developers all across the world."
      />
      <main id="main-content">
        <h1 className={h1Class}>Hello</h1>
      </main>
    </BrandingCssVarsProvider>
  );
}
