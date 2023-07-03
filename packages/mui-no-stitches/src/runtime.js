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

function getVariantClasses(props, variants, defaults) {
  const finalProps = props || {};
  const deletableKeys = [];

  const classNames = Object.entries(variants).map(([variantName, variantMap]) => {
    const hasVariantInProps = variantName in finalProps;
    const propVariantValue = finalProps[variantName];
    deletableKeys.push(variantName);
    // delete rest[variantName];
    const defaultVal = variantMap[defaults[variantName]];
    if (hasVariantInProps) {
      return variantMap[propVariantValue] ?? defaultVal;
    }
    return defaultVal;
  });

  return {
    classNames,
    deletableKeys,
  };
}

export function styled(tag, options = {}) {
  const { class: initClass, name, variants = {}, defaults = {} } = options;

  const StyledComponent = React.forwardRef(
    // eslint-disable-next-line react/prop-types
    ({ as: asProp, className, css: cssClassName, ...rest }, ref) => {
      const FinalComponent = asProp ?? tag;
      const { classNames: variantClasses, deletableKeys } = getVariantClasses(
        rest,
        variants,
        defaults,
      );
      deletableKeys.forEach((key) => {
        delete rest[key];
      });
      const finalClass = cx(initClass, ...variantClasses, className, cssClassName);
      return <FinalComponent {...rest} className={finalClass} ref={ref} />;
    },
  );

  StyledComponent.displayName = name;

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
export function icx() {
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
