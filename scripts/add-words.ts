import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config();

interface CsvRow {
	word: string;
	category: string;
}

interface CategoryMap {
	[name: string]: string;
}

interface Stats {
	totalRows: number;
	emptySkipped: number;
	duplicatesSkipped: number;
	alreadyExisted: number;
	inserted: number;
	categoriesCreated: number;
}

function loadEnvVariables(): { url: string; key: string } {
	const url = process.env.PUBLIC_SUPABASE_URL;
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) {
		throw new Error('Missing PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
	}
	return { url, key };
}

function createAdminClient(url: string, key: string): SupabaseClient {
	return createClient(url, key, {
		auth: { autoRefreshToken: false, persistSession: false }
	});
}

function parseCsv(filePath: string): { rows: CsvRow[]; emptySkipped: number } {
	const content = readFileSync(filePath, 'utf-8');
	const lines = content.trim().split('\n').slice(1);
	let emptySkipped = 0;

	const rows = lines
		.map((line) => parseRow(line))
		.filter((row) => {
			if (!row.word || row.word.trim() === '') {
				emptySkipped++;
				return false;
			}
			return true;
		});

	return { rows, emptySkipped };
}

function parseRow(line: string): CsvRow {
	const [word, category] = line.split(',').map((s) => s.trim());
	return { word: word || '', category: category || '' };
}

function deduplicateRows(rows: CsvRow[]): { unique: CsvRow[]; duplicatesSkipped: number } {
	const seen = new Set<string>();
	const unique: CsvRow[] = [];
	let duplicatesSkipped = 0;

	for (const row of rows) {
		const key = `${row.word.toLowerCase()}|${row.category.toLowerCase()}`;
		if (seen.has(key)) {
			duplicatesSkipped++;
		} else {
			seen.add(key);
			unique.push(row);
		}
	}

	return { unique, duplicatesSkipped };
}

async function getExistingCategories(supabase: SupabaseClient): Promise<CategoryMap> {
	const { data, error } = await supabase.from('categories').select('id, name');
	if (error) throw new Error(`Failed to fetch categories: ${error.message}`);
	return (data || []).reduce((acc, { id, name }) => ({ ...acc, [name]: id }), {});
}

async function ensureCategory(
	supabase: SupabaseClient,
	categoryMap: CategoryMap,
	categoryName: string
): Promise<string> {
	if (categoryMap[categoryName]) {
		return categoryMap[categoryName];
	}

	const { data, error } = await supabase
		.from('categories')
		.insert({ name: categoryName, approved: true })
		.select('id')
		.single();

	if (error) throw new Error(`Failed to create category: ${error.message}`);
	categoryMap[categoryName] = data.id;
	return data.id;
}

async function getExistingWords(supabase: SupabaseClient): Promise<Set<string>> {
	const { data, error } = await supabase.from('words').select('word, category_id');
	if (error) throw new Error(`Failed to fetch words: ${error.message}`);

	return new Set((data || []).map((w) => `${w.word.toLowerCase()}|${w.category_id}`));
}

async function insertWord(
	supabase: SupabaseClient,
	word: string,
	categoryId: string
): Promise<void> {
	const { error } = await supabase
		.from('words')
		.insert({ word, category_id: categoryId, approved: true });
	if (error) throw new Error(`Failed to insert word "${word}": ${error.message}`);
}

async function processWords(
	supabase: SupabaseClient,
	rows: CsvRow[],
	categoryMap: CategoryMap,
	existingWords: Set<string>
): Promise<{ inserted: number; alreadyExisted: number; categoriesCreated: number }> {
	let inserted = 0;
	let alreadyExisted = 0;
	const initialCategoryCount = Object.keys(categoryMap).length;

	for (const row of rows) {
		const categoryId = await ensureCategory(supabase, categoryMap, row.category);
		const wordKey = `${row.word.toLowerCase()}|${categoryId}`;

		if (existingWords.has(wordKey)) {
			alreadyExisted++;
			continue;
		}

		await insertWord(supabase, row.word, categoryId);
		existingWords.add(wordKey);
		inserted++;
	}

	const categoriesCreated = Object.keys(categoryMap).length - initialCategoryCount;
	return { inserted, alreadyExisted, categoriesCreated };
}

function printStats(stats: Stats): void {
	console.log('\n--- Results ---');
	console.log(`Total rows in CSV: ${stats.totalRows}`);
	console.log(`Empty words skipped: ${stats.emptySkipped}`);
	console.log(`Duplicates in CSV skipped: ${stats.duplicatesSkipped}`);
	console.log(`Already existed in DB: ${stats.alreadyExisted}`);
	console.log(`New categories created: ${stats.categoriesCreated}`);
	console.log(`New words inserted: ${stats.inserted}`);
}

async function main(): Promise<void> {
	const csvPath = process.argv[2];
	if (!csvPath) {
		console.error('Usage: npx tsx scripts/add-words.ts <path-to-csv>');
		process.exit(1);
	}

	console.log(`Reading CSV from: ${csvPath}`);
	const { url, key } = loadEnvVariables();
	const supabase = createAdminClient(url, key);

	const { rows: parsedRows, emptySkipped } = parseCsv(csvPath);
	const { unique: rows, duplicatesSkipped } = deduplicateRows(parsedRows);

	console.log(`Parsed ${parsedRows.length + emptySkipped} rows`);
	console.log(`Processing ${rows.length} unique non-empty words...`);

	const categoryMap = await getExistingCategories(supabase);
	const existingWords = await getExistingWords(supabase);

	const { inserted, alreadyExisted, categoriesCreated } = await processWords(
		supabase,
		rows,
		categoryMap,
		existingWords
	);

	printStats({
		totalRows: parsedRows.length + emptySkipped,
		emptySkipped,
		duplicatesSkipped,
		alreadyExisted,
		inserted,
		categoriesCreated
	});
}

main().catch((err) => {
	console.error('Error:', err.message);
	process.exit(1);
});
