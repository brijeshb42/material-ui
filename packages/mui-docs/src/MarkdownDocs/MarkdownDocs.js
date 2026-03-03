import PropTypes from 'prop-types';
import exactProp from '@mui/utils/exactProp';
import { Ad, AdGuest } from '../Ad';
import { useUserLanguage } from '../i18n';
import RichMarkdownElement from '../RichMarkdownElement';
import AppLayoutDocs from '../AppLayoutDocs';

export default function MarkdownDocs(props) {
  const {
    disableAd = false,
    disableToc = false,
    demos = {},
    docs,
    demoComponents,
    srcComponents,
  } = props;

  const userLanguage = useUserLanguage();
  const localizedDoc = docs[userLanguage] || docs.en;

  return (
    <AppLayoutDocs
      cardOptions={{
        description: localizedDoc.headers.cardDescription,
        title: localizedDoc.headers.cardTitle,
      }}
      description={localizedDoc.description}
      disableAd={disableAd}
      disableToc={disableToc}
      location={localizedDoc.location}
      title={localizedDoc.title}
      toc={localizedDoc.toc}
    >
      {disableAd ? null : (
        <AdGuest>
          <Ad />
        </AdGuest>
      )}
      {localizedDoc.rendered.map((renderedMarkdownOrDemo, index) => (
        <RichMarkdownElement
          key={`demos-section-${index}`}
          demoComponents={demoComponents}
          demos={demos}
          disableAd={disableAd}
          localizedDoc={localizedDoc}
          renderedMarkdownOrDemo={renderedMarkdownOrDemo}
          srcComponents={srcComponents}
        />
      ))}
    </AppLayoutDocs>
  );
}

MarkdownDocs.propTypes = {
  demoComponents: PropTypes.object,
  demos: PropTypes.object,
  disableAd: PropTypes.bool,
  disableToc: PropTypes.bool,
  docs: PropTypes.object.isRequired,
  srcComponents: PropTypes.object,
};

if (process.env.NODE_ENV !== 'production') {
  MarkdownDocs.propTypes = exactProp(MarkdownDocs.propTypes);
}
