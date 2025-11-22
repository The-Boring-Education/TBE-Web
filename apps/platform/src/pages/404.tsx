import { NotFoundPage } from '@tbe/components';

const NotFound = () => {
  return (
    <NotFoundPage
      config={{
        brandName: 'The Boring Education',
        tagline: 'Tech Education for Everyone',
        enableSEO: true,
        showBackButton: false,
        showSupport: true,
        homeUrl: 'https://theboringeducation.com',
      }}
    />
  );
};

export default NotFound;
