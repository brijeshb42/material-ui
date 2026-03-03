import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from 'docs/data/system/properties/properties.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
