export interface ResourceMeta {
  title: string;
  description: string;
  keywords?: string[];
  /** Absolute URL for Open Graph / Twitter */
  ogImage?: string;
  tags?: string[];
}

export interface ResourceIndexEntry {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  tags: string[];
}
