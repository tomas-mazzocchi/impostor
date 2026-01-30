-- Remove duplicate words before adding constraint (keep first occurrence)
DELETE FROM words a USING words b
WHERE a.id > b.id AND lower(a.word) = lower(b.word);

-- Remove duplicate categories before adding constraint (keep first occurrence)
DELETE FROM categories a USING categories b
WHERE a.id > b.id AND lower(a.name) = lower(b.name);

-- Add unique constraint on category name (case-insensitive via functional index)
CREATE UNIQUE INDEX categories_name_unique ON categories (lower(name));

-- Add unique constraint on word (case-insensitive via functional index)
CREATE UNIQUE INDEX words_word_unique ON words (lower(word));
