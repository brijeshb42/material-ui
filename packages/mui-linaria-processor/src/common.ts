import { cache, css } from '@emotion/css';
import type { CSSObject } from '@emotion/serialize';
import type { IOptions } from '@linaria/tags';
import { createTheme } from '@mui/material/styles';
import type { SxConfig } from '@mui/system';
import styleFunctionSx, {
  unstable_defaultSxConfig as defaultSxConfig,
} from '@mui/system/styleFunctionSx';

export { SxConfig };
export type ICustomOptions<
  T extends {
    unstable_sxConfig?: SxConfig;
  },
> = IOptions & {
  theme?: T;
  darkTheme?: T;
  prefix?: string;
};

export function getTheme<
  T extends {
    unstable_sxConfig?: SxConfig;
  },
>(theme: T | undefined, prefix = ''): T {
  const sxConfig = {
    ...defaultSxConfig,
    ...(theme ?? {}).unstable_sxConfig,
  };

  Object.keys(sxConfig).forEach((configKey) => {
    let value = sxConfig[configKey];
    if (value.themeKey === 'palette' && value.transform) {
      value = {
        ...value,
        transform: (cssValue: unknown, userValue: unknown) => {
          if (cssValue === userValue) {
            return cssValue as string;
          }
          if (
            typeof userValue === 'string' &&
            !userValue.startsWith('rgb') &&
            userValue.includes('.')
          ) {
            return [
              cssValue as string,
              `var(--${prefix ? `${prefix}-` : ''}palette-${(userValue as string)
                .split('.')
                .join('-')}, ${cssValue})`,
            ];
          }
          return cssValue as string;
        },
      };
      sxConfig[configKey] = value;
    }
  });

  if (!theme) {
    const newTheme = createTheme({
      unstable_sxConfig: sxConfig,
    });
    return newTheme as unknown as T;
  }
  theme.unstable_sxConfig = sxConfig;
  return theme;
}

export function generateSxCss<T extends {}>(
  inputObj: CSSObject | ((param: { theme: T; darkTheme: T }) => CSSObject),
  theme: T,
  darkTheme: T,
) {
  const cssObj = styleFunctionSx({
    sx: typeof inputObj === 'function' ? inputObj({ theme, darkTheme }) : inputObj,
    theme,
  });
  if (typeof cssObj === 'string') {
    return cssObj;
  }
  const resultClass = css([cssObj as any]);
  const finalCss = cache.registered[resultClass];
  if (typeof finalCss === 'boolean') {
    return '';
  }

  return finalCss;
}
