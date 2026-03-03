import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from 'docs/data/material/customization/how-to-customize/how-to-customize.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
