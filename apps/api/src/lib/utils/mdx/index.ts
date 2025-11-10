import fs from 'fs';
import path from 'path';

const getMDXContent = (filePath = 'testing.md') => {
  const mdFilePath = path.join(process.cwd(), 'src', 'utils', 'mdx', filePath);
  const mdxPayload = fs.readFileSync(mdFilePath, 'utf8');
  return mdxPayload;
};

export { getMDXContent };
