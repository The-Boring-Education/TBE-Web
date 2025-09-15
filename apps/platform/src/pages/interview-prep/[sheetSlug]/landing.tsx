import SheetLandingPage from '@/components/containers/Page/Interview-sheet/SheetLandingPage';
import type { SheetPageProps } from '@/interfaces';
import { getSheetPageProps } from '@/utils';

const SheetLandingPageRoute = ({ sheet, meta, slug, seoMeta }: SheetPageProps) => {
  return (
    <SheetLandingPage
      sheet={sheet}
      meta={meta}
      slug={slug}
      seoMeta={seoMeta}
    />
  );
};

export const getServerSideProps = getSheetPageProps;

export default SheetLandingPageRoute;