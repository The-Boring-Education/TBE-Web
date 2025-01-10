import fs from 'fs';
import path from 'path';

const getCSVContent = (): Promise<Array<{ name: string; email: string }>> => {
  return new Promise((resolve, reject) => {
    const csvFilePath = path.join(
      process.cwd(),
      'src',
      'utils',
      'csv',
      'testing.csv'
    );

    fs.readFile(csvFilePath, 'utf8', (err, data) => {
      if (err) {
        reject('Error reading CSV file');
        return;
      }

      const jsonData: Array<{ name: string; email: string }> = [];

      const rows = data.split('\n');

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (row) {
          const values = row.split(',');

          const obj: { name: string; email: string } = {
            name: values[0],
            email: values[1],
          };

          jsonData.push(obj);
        }
      }

      resolve(jsonData);
    });
  });
};

export { getCSVContent };
