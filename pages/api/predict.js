import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'public', 'insurance.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvData, { columns: true, skip_empty_lines: true });

    // Generate simple mock predictions
    const predictions = records.slice(0, 50).map((record, index) => {
      const actualValue = parseFloat(record.charges);
      return {
        index,
        actual: actualValue,
        predicted: actualValue * (0.8 + Math.random() * 0.4) // Random prediction between 80% and 120% of actual
      };
    });

    console.log('Sending predictions:', predictions.slice(0, 2)); // Debug log first two items
    res.status(200).json({ predictions });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
} 