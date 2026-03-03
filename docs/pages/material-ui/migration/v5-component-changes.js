import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from 'docs/data/material/migration/migration-v4/v5-component-changes.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
