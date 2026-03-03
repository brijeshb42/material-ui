import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from 'docs/data/joy/customization/theme-builder/theme-builder.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} disableToc />;
}
