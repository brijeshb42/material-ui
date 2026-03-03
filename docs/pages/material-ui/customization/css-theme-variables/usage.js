import MarkdownDocs from '@mui/docs/MarkdownDocs';
import {
  demos,
  docs,
  demoComponents,
} from 'docs/data/material/customization/css-theme-variables/usage.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs demos={demos} docs={docs} demoComponents={demoComponents} />;
}
