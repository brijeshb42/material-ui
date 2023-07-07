import * as React from 'react';

function cx(...classes) {
  let str = '';

  classes.forEach((cls) => {
    if (!cls) {
      return;
    }
    if (typeof cls === 'string') {
      if (str.endsWith(' ') || !str) {
        str += cls;
      } else {
        str += ` ${cls}`;
      }
    }
  });

  return str;
}

function getVariantClasses(props, variants, defaults = {}, compound = undefined) {
  const finalProps = props || {};
  const deletableKeys = [];
  const finalVariants = {};

  const classNames = variants
    ? Object.entries(variants).map(([variantName, variantMap]) => {
        const hasVariantInProps = variantName in finalProps;
        const propVariantValue = finalProps[variantName];
        deletableKeys.push(variantName);
        // delete rest[variantName];
        const defaultVal = variantMap[defaults[variantName]];
        if (hasVariantInProps) {
          finalVariants[variantName] = propVariantValue ?? defaults[variantName];
          return variantMap[propVariantValue] ?? defaultVal;
        }
        finalVariants[variantName] = defaults[variantName];
        return defaultVal;
      })
    : [];

  if (compound?.length) {
    classNames.push(
      ...compound
        .filter(({ css: cssClass, ...restVariants }) =>
          Object.entries(restVariants).every(([key, value]) => finalVariants[key] === value),
        )
        .map((item) => item.css),
    );
  }

  return {
    classNames,
    deletableKeys,
  };
}

export function styled(tag, options = {}) {
  const { class: initClass, name, variants = {}, defaults = {}, compound } = options;

  const StyledComponent = React.forwardRef(
    // eslint-disable-next-line react/prop-types
    ({ as: asProp, className, css: cssClassName, ownerState, ...rest }, ref) => {
      const FinalComponent = asProp ?? tag;
      const { classNames: variantClasses, deletableKeys } = getVariantClasses(
        rest,
        variants,
        defaults,
        compound,
      );
      deletableKeys.forEach((key) => {
        delete rest[key];
      });
      const finalClass = cx(className, initClass, ...variantClasses, cssClassName);
      if (typeof FinalComponent === 'string' || !FinalComponent.isStitchesStyled) {
        return <FinalComponent {...rest} className={finalClass} ref={ref} />;
      }
      return <FinalComponent {...rest} ownerState={ownerState} className={finalClass} ref={ref} />;
    },
  );

  StyledComponent.displayName = name;
  StyledComponent.isStitchesStyled = true;

  return StyledComponent;
}

export function css({ class: baseClass, variants, defaults }) {
  return (props) => {
    const { classNames } = getVariantClasses(props, variants, defaults);
    return cx(baseClass, ...classNames);
  };
}

/**
 * @param {import('@stitches/react').CSS} css
 * @returns {import('@stitches/react').CSS}
 */
export function icss() {
  throw new Error(
    'Usage of "icx" should not end up in your runtime. If you are seeing this error, please check your build tool configuration.',
  );
}

export function keyframes() {
  throw new Error(
    'Usage of "keyframes" should not end up in your runtime. If you are seeing this error, please check your build tool configuration.',
  );
}

export function globalCss() {
  throw new Error(
    'Usage of "globalCss" should not end up in your runtime. If you are seeing this error, please check your build tool configuration.',
  );
}
