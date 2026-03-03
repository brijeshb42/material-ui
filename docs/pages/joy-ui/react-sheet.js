import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from 'docs/data/joy/components/sheet/sheet.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
