import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from 'docs/data/material/getting-started/supported-components/supported-components.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
