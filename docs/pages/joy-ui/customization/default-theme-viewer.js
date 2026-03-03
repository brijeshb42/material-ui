import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from 'docs/data/joy/customization/default-theme-viewer/default-theme-viewer.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} disableToc />;
}
