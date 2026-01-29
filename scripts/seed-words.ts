import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
import * as readline from 'readline';

config();

interface CsvRow {
	word: string;
	category: string;
}

interface CategoryMap {
	[name: string]: string;
}

function loadEnvVariables(): { url: string; key: string } {
	const url = process.env.PUBLIC_SUPABASE_URL;
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) {
		throw new Error('Missing PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
	}
	return { url, key };
}

function createAdminClient(url: string, key: string): SupabaseClient {
	return createClient(url, key, {
		auth: { autoRefreshToken: false, persistSession: false }
	});
}

function parseCsv(filePath: string): CsvRow[] {
	const content = readFileSync(filePath, 'utf-8');
	const lines = content.trim().split('\n');
	const rows = lines.slice(1);
	return rows.map(parseRow);
}

function parseRow(line: string): CsvRow {
	const [word, category] = line.split(',').map((s) => s.trim());
	return { word, category };
}

function extractUniqueCategories(rows: CsvRow[]): string[] {
	const categories = new Set(rows.map((r) => r.category));
	return Array.from(categories);
}

async function clearExistingData(supabase: SupabaseClient): Promise<void> {
	console.log('Clearing existing words...');
	const { error: wordsError } = await supabase.from('words').delete().not('id', 'is', null);
	if (wordsError) throw new Error(`Failed to clear words: ${wordsError.message}`);

	console.log('Clearing existing categories...');
	const { error: catError } = await supabase.from('categories').delete().not('id', 'is', null);
	if (catError) throw new Error(`Failed to clear categories: ${catError.message}`);
}

async function insertCategories(
	supabase: SupabaseClient,
	categories: string[]
): Promise<CategoryMap> {
	const categoryData = categories.map((name) => ({ name, approved: true }));
	const { data, error } = await supabase.from('categories').insert(categoryData).select('id, name');
	if (error) throw new Error(`Failed to insert categories: ${error.message}`);
	return buildCategoryMap(data);
}

function buildCategoryMap(data: { id: string; name: string }[]): CategoryMap {
	return data.reduce((acc, { id, name }) => ({ ...acc, [name]: id }), {} as CategoryMap);
}

async function insertWords(
	supabase: SupabaseClient,
	rows: CsvRow[],
	categoryMap: CategoryMap
): Promise<number> {
	const wordData = rows.map((row) => ({
		word: row.word,
		category_id: categoryMap[row.category],
		approved: true
	}));
	const { error } = await supabase.from('words').insert(wordData);
	if (error) throw new Error(`Failed to insert words: ${error.message}`);
	return wordData.length;
}

async function confirmAction(): Promise<boolean> {
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
	return new Promise((resolve) => {
		rl.question('This will DELETE all existing words and categories. Continue? (y/N): ', (ans) => {
			rl.close();
			resolve(ans.toLowerCase() === 'y');
		});
	});
}

async function main(): Promise<void> {
	const csvPath = process.argv[2];
	if (!csvPath) {
		console.error('Usage: npm run seed -- <path-to-csv>');
		process.exit(1);
	}

	const confirmed = await confirmAction();
	if (!confirmed) {
		console.log('Aborted.');
		process.exit(0);
	}

	const { url, key } = loadEnvVariables();
	const supabase = createAdminClient(url, key);
	const rows = parseCsv(csvPath);
	const categories = extractUniqueCategories(rows);

	console.log(`Parsed ${rows.length} words in ${categories.length} categories`);

	await clearExistingData(supabase);
	const categoryMap = await insertCategories(supabase, categories);
	const wordCount = await insertWords(supabase, rows, categoryMap);

	console.log(`Inserted ${categories.length} categories and ${wordCount} words`);
}

main().catch((err) => {
	console.error('Error:', err.message);
	process.exit(1);
});
