import type { PluginOptions as LinariaPluginOptions } from '@linaria/babel-preset';
import type { DefaultThemeMap, createStitches, createTheme } from '@stitches/react';

type CreateStitchesConfigParam = {
  defaultThemeMap: DefaultThemeMap;
};

type StitchesConfig = {
  readableVariantClass?: boolean;
  createStitchesConfig?(param: CreateStitchesConfigParam): Parameters<typeof createStitches>[0];
  themes?: {
    [key: string]: Parameters<typeof createTheme>[0] | [string, Parameters<typeof createTheme>[0]];
  };
};

export type StitchesPluginConfig = LinariaPluginOptions & StitchesConfig;

const baseConfig = {
  babelOptions: {
    plugins: ['@babel/plugin-transform-typescript'],
  },
  preprocessor(_selector: string, css: string) {
    // everything is already done. no pre-processing required.
    return css;
  },
  tagResolver(source: string, tag: string) {
    if (!source.startsWith('@mui/no-stitches') && !source.startsWith('@stitches/')) {
      return null;
    }
    switch (tag) {
      case 'styled':
        return '@mui/no-stitches/styled';
      case 'css':
        return '@mui/no-stitches/css';
      case 'keyframes':
        return '@mui/no-stitches/keyframes';
      case 'icss':
        return '@mui/no-stitches/icss';
      case 'globalCss':
        return '@mui/no-stitches/globalCss';
      default:
        return null;
    }
  },
};

export default baseConfig;
