import * as React from 'react';
import { styled } from '@brijeshb42/zero-runtime';
import BrandingCssVarsProvider from 'docs/src/BrandingCssVarsProvider';
import Head from 'docs/src/modules/components/Head';

const H1 = styled.h1({
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
        <H1>Hello</H1>
      </main>
    </BrandingCssVarsProvider>
  );
}
