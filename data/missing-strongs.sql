SELECT "Lemma".id, "Lemma".title, "Text".book, "Text".chapter, "Text"."verseNumber", "Text".text, "Text".parsing FROM "Lemma"
INNER JOIN "Text" ON "Text".lemma = "Lemma".title
WHERE strongs IS NULL
ORDER BY "Lemma".id