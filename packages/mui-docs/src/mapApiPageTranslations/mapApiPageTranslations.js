import { createRender } from '@mui/internal-markdown';

const notEnglishJsonRegExp = /-([a-z]{2})\.json$/;

/**
 * @param {object} req - webpack require.context result
 * @param {object} [options] - optional configuration
 * @param {function} [options.ignoreLanguagePages] - function to determine if a page should be ignored for a language
 */
export default function mapApiPageTranslations(req, options = {}) {
  const { ignoreLanguagePages } = options;
  const headingHashes = {};
  const translations = {};

  // Process the English markdown before the other locales.
  // English ToC anchor links are used in all languages
  let filenames = [];
  req.keys().forEach((filename) => {
    if (filename.match(notEnglishJsonRegExp)) {
      filenames.push(filename);
    } else {
      filenames = [filename].concat(filenames);
    }
  });

  filenames.forEach((filename) => {
    const matchNotEnglishMarkdown = filename.match(notEnglishJsonRegExp);
    const userLanguage = matchNotEnglishMarkdown !== null ? matchNotEnglishMarkdown[1] : 'en';
    const translation = req(filename) || null;

    if (translation !== null && translation.componentDescription) {
      const componentDescriptionToc = [];
      const render = createRender({
        headingHashes,
        toc: componentDescriptionToc,
        userLanguage,
        location: filenames,
        options: {
          ignoreLanguagePages: ignoreLanguagePages || (() => false),
          env: {
            SOURCE_CODE_REPO: '',
          },
        },
      });
      translation.componentDescription = render(translation.componentDescription);
      translation.componentDescriptionToc = componentDescriptionToc;
    }

    translations[userLanguage] = translation;
  });

  return translations;
}
