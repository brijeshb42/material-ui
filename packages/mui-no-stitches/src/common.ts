import { IOptions } from '@linaria/tags';
import type { CreateStitches, DefaultThemeMap, createTheme } from '@stitches/react';
import { createStitches, defaultThemeMap } from '@stitches/react';

export type VariantToClassMapping = { [key: string]: { [key: string]: string } };

export type CreateStitchesConfigParam = {
  defaultThemeMap: DefaultThemeMap;
};

export type Options = {
  baseClass: string;
  readableVariantClass?: boolean;
  isInline?: boolean;
  overrideClassName?: string;
  createStitchesConfig?(params: CreateStitchesConfigParam): Parameters<typeof createStitches>[0];
  themes?: {
    [key: string]: Parameters<typeof createTheme>[0] | [string, Parameters<typeof createTheme>[0]];
  };
};

type OnlyStitchesOptions = Pick<Options, 'createStitchesConfig' | 'themes'>;

export type WithStitchesOptions = IOptions & OnlyStitchesOptions;

function cleanUpCss(css: string, classReplacers: [string, string][]) {
  const rgx = /--sxs\{.*?\}/gim;
  const withoutSxs = classReplacers.reduce((finalCss, [stitchClass, linariaClass]) => {
    return finalCss.replaceAll(stitchClass, linariaClass);
  }, css.replace(rgx, ''));
  return withoutSxs.replaceAll('@media{}', '');
}

let stitchesWithThemes: {
  stitches: ReturnType<CreateStitches>;
  themes: Record<string, unknown>;
} | null = null;
let stitchesWithoutThemes: {
  stitches: ReturnType<CreateStitches>;
  themes: Record<string, unknown>;
} | null = null;

function getStitches({ createStitchesConfig, themes }: OnlyStitchesOptions) {
  if (stitchesWithoutThemes) {
    return stitchesWithoutThemes;
  }

  const config = createStitchesConfig?.({ defaultThemeMap }) ?? {};

  if (stitchesWithThemes) {
    delete config.theme;
    stitchesWithoutThemes = {
      // @ts-ignore
      stitches: createStitches({ root: null, ...config }),
      themes: stitchesWithThemes.themes,
    };
    // stitchesWithoutThemes.stitches.reset();
    return stitchesWithoutThemes;
  }
  // @ts-ignore
  const stitches = createStitches({ root: null, ...config });
  const createdThemes: Record<string, unknown> = {
    theme: stitches.theme,
  };

  if (themes) {
    Object.keys(themes).forEach((themeKey) => {
      const themeTokens = themes[themeKey];
      if (Array.isArray(themeTokens) && themeTokens.length !== 2) {
        throw new Error(
          `Incorrect number of arguments for theme ${themeKey} provided in config. It accepts exactly 2 arguments.`,
        );
      }
      const theme = Array.isArray(themeTokens)
        ? stitches.createTheme(...themeTokens)
        : stitches.createTheme(themeTokens);
      // call toString for each theme to get it added to the css output.
      theme.toString();
      createdThemes[themeKey] = theme;
    });
  }

  stitchesWithThemes = {
    stitches,
    themes: createdThemes,
  };
  return stitchesWithThemes;
}

export function processCssObject(inputCssOrFn: Object | Function, options: Options) {
  const {
    baseClass: linariaClassname,
    readableVariantClass = true,
    isInline = false,
    overrideClassName = undefined,
  } = options;
  const { stitches, themes } = getStitches(options);
  const replacerClassName = overrideClassName
    ? `${overrideClassName}.${linariaClassname}`
    : linariaClassname;
  const inputCss =
    typeof inputCssOrFn === 'function' ? inputCssOrFn(themes, stitches) : inputCssOrFn;
  // not sure why, but eval-time objects in Linaria inherit Function object and stitches has explicit checks to only allow objects inheriting "Object". So using "structuredClone".
  const valuedObject = structuredClone(inputCss) as Object & {
    variants?: {
      [key: string]: {
        [key: string]: Object;
      };
    };
    defaultVariants?: {
      [key: string]: string;
    };
  };
  const defaultVariants = valuedObject.defaultVariants;
  delete valuedObject.defaultVariants;

  let count = 1;
  const getCount = () => {
    const ret = count;
    count += 1;
    return ret;
  };
  const cls = stitches.css(!isInline ? (valuedObject as any) : undefined);
  const baseClass = cls.toString();
  const classReplacers: [string, string][] = [];
  const inlineClassNames = cls(isInline ? { css: valuedObject as any } : undefined).toString();
  const variants = valuedObject.variants;
  const variantToClassMapping: VariantToClassMapping = {};
  if (variants) {
    Object.keys(variants).forEach((variantName) => {
      const mapping: { [key: string]: string } = {};
      variantToClassMapping[variantName] = {};
      Object.keys(variants[variantName]).forEach((variantType) => {
        const variantClasses = cls({ [variantName]: variantType }).toString();
        const variantClass = variantClasses.split(' ').filter((cls1) => cls1 !== baseClass)[0];
        const linariaClass = readableVariantClass
          ? `${linariaClassname}-${variantName}-${variantType}`
          : `${linariaClassname}-${getCount()}`;
        classReplacers.push([variantClass, linariaClass]);
        mapping[variantType] = linariaClass;
      });
      variantToClassMapping[variantName] = mapping;
    });
  }
  if (isInline) {
    const inlineClassName = inlineClassNames.split(' ').filter((cls1) => cls1 !== baseClass)[0];
    classReplacers.push([inlineClassName, replacerClassName]);
  }
  classReplacers.push([baseClass, replacerClassName]);
  const css = stitches.getCssText();
  stitches.reset();
  return {
    variantToClassMapping,
    cssText: cleanUpCss(css, classReplacers),
    defaultVariants,
  };
}

export function processKeyframe(inputKeyframesOrFn: Object | Function, options: Options) {
  const { baseClass: linariaClassname } = options;
  const { stitches, themes } = getStitches(options);
  const inputKeyframes =
    typeof inputKeyframesOrFn === 'function'
      ? inputKeyframesOrFn(themes, stitches)
      : inputKeyframesOrFn;
  const valuedObject = structuredClone(inputKeyframes) as Object;
  const keyframeFn = stitches.keyframes(valuedObject as any);
  const baseClass = keyframeFn();
  const classReplacers: [string, string][] = [[baseClass, linariaClassname]];
  const finalCss = cleanUpCss(stitches.getCssText(), classReplacers);
  stitches.reset();
  return finalCss;
}

export function processGlobalCss(inputCssOrFn: Object | Function, options: Options) {
  const { stitches, themes } = getStitches(options);
  const inputCssObj =
    typeof inputCssOrFn === 'function' ? inputCssOrFn(themes, stitches) : inputCssOrFn;
  const valuedObject = structuredClone(inputCssObj) as Object;
  const globalCssFn = stitches.globalCss(valuedObject as any);
  globalCssFn();
  const cssText = cleanUpCss(stitches.getCssText(), []);
  stitches.reset();
  return cssText;
}
