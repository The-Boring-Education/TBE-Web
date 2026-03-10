import { SheetLandingPage } from '@tbe/components';
import type { SheetPageProps } from '@tbe/interface';
import { getSheetPageProps } from '@tbe/utils';

const SheetLandingPageRoute = ({
  sheet,
  meta,
  slug,
  seoMeta,
}: SheetPageProps) => (
  <SheetLandingPage sheet={sheet} meta={meta} slug={slug} seoMeta={seoMeta} />
);

export const getServerSideProps = getSheetPageProps;

export default SheetLandingPageRoute;
