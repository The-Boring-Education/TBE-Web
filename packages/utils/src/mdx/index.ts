import fs from 'fs';
import path from 'path';

const getMDXContent = (filePath = 'testing.md') => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    throw new Error('getMDXContent can only be used on the server side');
  }
  
  const mdFilePath = path.join(process.cwd(), 'src', 'utils', 'mdx', filePath);
  const mdxPayload = fs.readFileSync(mdFilePath, 'utf8');
  return mdxPayload;
};

export { getMDXContent };
