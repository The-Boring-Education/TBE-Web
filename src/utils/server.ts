// Only Server-specific code should be here
import fs from 'fs';

const readJSONFile = (path: string): any | null => {
  if (!fs.existsSync(path)) return null;
  return JSON.parse(fs.readFileSync(path, 'utf8'));
};

const writeJSONFile = (path: string, data: any) => {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
};

export { readJSONFile, writeJSONFile };
