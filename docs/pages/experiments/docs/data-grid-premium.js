import ApiPage from '@mui/docs/ApiPage';
import jsonPageContent from './data-grid-premium.json';
import descriptions from './data-grid-premium-translation.json';

export default function Page() {
  return <ApiPage descriptions={{ en: descriptions }} pageContent={jsonPageContent} />;
}
