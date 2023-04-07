export interface LinkProps {
  children: React.ReactNode;
  className?: string;
  href: string;
}

export interface TextProps {
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
  children: React.ReactNode;
  className?: string;
}

export interface ImageContainerProps {
  src: string;
  alt: string;
  className: string;
  loading?: 'lazy' | 'eager';
}

export interface LogoProps {
  className?: string;
}
