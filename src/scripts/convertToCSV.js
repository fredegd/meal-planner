import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import gustario data
const gustarioPath = path.join(__dirname, '../data/gustario.js');
const { default: gustario } = await import(gustarioPath);

// Define CSV headers
const headers = [
    'title',
    'image_url',
    'ingredients',
    'nutrition_kcal',
    'portions',
    'rating',
    'source_url',
    'source_website',
    'total_time',
    'diet',
    'keywords'
].join(',');

// Convert recipes to CSV rows
const rows = gustario.map(recipe => {
    return [
        `"${(recipe.title || '').replace(/"/g, '""')}"`,
        `"${(recipe.image_urls?.[0] || '').replace(/"/g, '""')}"`,
        `"${JSON.stringify(recipe.ingredients || []).replace(/"/g, '""')}"`,
        `"${JSON.stringify(recipe.nutrition || []).replace(/"/g, '""')}"`,
        recipe.portions || '',
        `"${JSON.stringify(recipe.rating || []).replace(/"/g, '""')}"`,

        `"${(recipe.source_url || '').replace(/"/g, '""')}"`,
        `"${(recipe.source_website || '').replace(/"/g, '""')}"`,
        recipe.totalTime || '',
        `"${JSON.stringify(recipe.diet || []).replace(/"/g, '""')}"`,
        `"${JSON.stringify((recipe.keywords)?.split(',') || []).replace(/"/g, '""')}"`
    ].join(',');
});

// Combine headers and rows
const csvContent = [headers, ...rows].join('\n');

// Write to file
const outputPath = path.join(__dirname, '../data/gustario.csv');
fs.writeFileSync(outputPath, csvContent, 'utf-8');
console.log(`CSV file has been created at: ${outputPath}`);