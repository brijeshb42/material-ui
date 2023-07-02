import { IOptions } from '@linaria/tags';
import type { DefaultThemeMap, createTheme } from '@stitches/react';
import { createStitches, defaultThemeMap } from '@stitches/react';

export type VariantToClassMapping = { [key: string]: { [key: string]: string } };

export type CreateStitchesConfigParam = {
  defaultThemeMap: DefaultThemeMap;
};

export type Options = {
  baseClass: string;
  readableVariantClass?: boolean;
  createStitchesConfig?(params: CreateStitchesConfigParam): Parameters<typeof createStitches>[0];
  themes?: {
    [key: string]: Parameters<typeof createTheme>[0];
  };
};

type OnlyStitchesOptions = Pick<Options, 'createStitchesConfig' | 'themes'>;

export type WithStitchesOptions = IOptions & OnlyStitchesOptions;

function cleanUpCss(css: string, classReplacers: [string, string][]) {
  const rgx = /--sxs\{.*?\}/gim;
  return classReplacers.reduce((finalCss, [stitchClass, linariaClass]) => {
    return finalCss.replaceAll(stitchClass, linariaClass);
  }, css.replace(rgx, ''));
}

function getStitches({ createStitchesConfig, themes }: OnlyStitchesOptions) {
  const config = createStitchesConfig?.({ defaultThemeMap }) ?? {};
  // @ts-ignore
  const stitches = createStitches({ root: null, ...config });
  const createdThemes: Record<string, unknown> = {
    theme: stitches.theme,
  };

  if (themes) {
    Object.keys(themes).forEach((themeKey) => {
      createdThemes[themeKey] = stitches.createTheme(themes[themeKey]);
    });
  }

  return {
    stitches,
    themes: createdThemes,
  };
}

export function processCssObject(inputCssOrFn: Object | Function, options: Options) {
  const { baseClass: linariaClassname, readableVariantClass = true } = options;
  const { stitches, themes } = getStitches(options);
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
  const cls = stitches.css(valuedObject as any);
  const baseClass = cls.toString();
  const classReplacers: [string, string][] = [];
  cls();
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
  classReplacers.push([baseClass, linariaClassname]);
  const cssText = cleanUpCss(stitches.getCssText(), classReplacers);
  return {
    variantToClassMapping,
    cssText,
    defaultVariants,
  };
}

export function processKeyframe(inputKeyframesOrFn: Object, options: Options) {
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
  return cleanUpCss(stitches.getCssText(), classReplacers);
}
