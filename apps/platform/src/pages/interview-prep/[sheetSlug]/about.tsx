import { useRouter } from 'next/router';
import { useEffect } from 'react';

import type { SheetPageProps } from '@tbe/interface';
import { getSheetPageProps } from '@tbe/utils';

const SheetAboutPage = ({ sheet, meta, slug, seoMeta }: SheetPageProps) => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new landing page
    router.replace(`/interview-prep/${slug}/landing`);
  }, [router, slug]);

  // Return null while redirecting
  return null;
};

export const getServerSideProps = getSheetPageProps;

export default SheetAboutPage;