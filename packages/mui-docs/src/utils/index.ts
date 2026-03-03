export { default as addHiddenInput } from './addHiddenInput';
export {
  CodeStylingProvider,
  useCodeStyling,
  useNoSsrCodeStyling,
  useSetCodeStyling,
} from './codeStylingSolution';
export {
  CodeVariantProvider,
  useCodeVariant,
  useNoSsrCodeVariant,
  useSetCodeVariant,
} from './codeVariant';
export { default as findActivePage } from './findActivePage';
export { default as getProductInfoFromUrl } from './getProductInfoFromUrl';
export type { MuiProductId } from './getProductInfoFromUrl';
export { default as globalSelector } from './globalSelector';
export {
  LANGUAGES_SSR,
  pascalCase,
  pageToTitle,
  pageToTitleI18n,
  getCookie,
  pathnameToLanguage,
} from './helpers';
export type { Page } from './helpers';
export { default as loadScript } from './loadScript';
export { default as stylingSolutionMapping } from './stylingSolutionMapping';
