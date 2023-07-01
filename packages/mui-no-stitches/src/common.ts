import { IOptions } from '@linaria/tags';
import type { DefaultThemeMap } from '@stitches/react';
import { createStitches, defaultThemeMap } from '@stitches/react';

export type VariantToClassMapping = { [key: string]: { [key: string]: string } };

export type CreateStitchesConfigParam = {
  defaultThemeMap: DefaultThemeMap;
};

export type Options = {
  baseClass: string;
  readableVariantClass?: boolean;
  createStitchesConfig?(params: CreateStitchesConfigParam): Parameters<typeof createStitches>[0];
};

export type WithStitchesOptions = IOptions & Pick<Options, 'createStitchesConfig'>;

function cleanUpCss(css: string, classReplacers: [string, string][]) {
  const rgx = /--sxs\{.*?\}/gim;
  return classReplacers.reduce((finalCss, [stitchClass, linariaClass]) => {
    return finalCss.replaceAll(stitchClass, linariaClass);
  }, css.replace(rgx, ''));
}

function getStitches({ createStitchesConfig }: Pick<Options, 'createStitchesConfig'>) {
  const config = createStitchesConfig?.({ defaultThemeMap }) ?? {};
  // @ts-ignore
  return createStitches({ root: null, ...config });
}

export function processCssObject(inputCss: Object, options: Options) {
  const { baseClass: linariaClassname, readableVariantClass = true } = options;
  const stitches = getStitches(options);
  console.log(stitches.config);
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

export function processKeyframe(inputKeyframes: Object, options: Options) {
  const { baseClass: linariaClassname } = options;
  const stitches = getStitches(options);
  const valuedObject = structuredClone(inputKeyframes) as Object;
  const keyframeFn = stitches.keyframes(valuedObject as any);
  const baseClass = keyframeFn();
  const classReplacers: [string, string][] = [[baseClass, linariaClassname]];
  return cleanUpCss(stitches.getCssText(), classReplacers);
}
