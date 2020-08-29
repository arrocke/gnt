CREATE TABLE "public"."Book" (
  id SERIAL PRIMARY KEY NOT NULL,
  "name" TEXT UNIQUE NOT NULL UNIQUE
);

CREATE TABLE "public"."Chapter" (
  id SERIAL PRIMARY KEY NOT NULL,
  number INTEGER NOT NULL,
  "bookId" INTEGER NOT NULL,
  UNIQUE("bookId", number),
  FOREIGN KEY ("bookId") REFERENCES "public"."Book"(id)
);

CREATE TABLE "public"."Verse" (
  id SERIAL PRIMARY KEY NOT NULL,
  number INTEGER NOT NULL,
  "chapterId" INTEGER NOT NULL,
  UNIQUE("chapterId", number),
  FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"(id)
);

CREATE TABLE "public"."Paragraph" (
  id SERIAL PRIMARY KEY NOT NULL,
  "bookId" INTEGER NOT NULL,
  FOREIGN KEY ("bookId") REFERENCES "public"."Book"(id)
);

CREATE TABLE "public"."Lemma" (
  id SERIAL PRIMARY KEY NOT NULL,
  title TEXT UNIQUE NOT NULL,
  "fullLemma" TEXT UNIQUE,
  strongs INTEGER UNIQUE,
  brief TEXT,
  description TEXT
);

CREATE TABLE "public"."Speech" (
  id SERIAL PRIMARY KEY NOT NULL,
  description TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL
);

CREATE TABLE "public"."Person" (
  id SERIAL PRIMARY KEY NOT NULL,
  "description" TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL
);

CREATE TABLE "public"."Tense" (
  id SERIAL PRIMARY KEY NOT NULL,
  "description" TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL
);

CREATE TABLE "public"."Voice" (
  id SERIAL PRIMARY KEY NOT NULL,
  "description" TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL
);

CREATE TABLE "public"."Mood" (
  id SERIAL PRIMARY KEY NOT NULL,
  "description" TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL
);

CREATE TABLE "public"."Case" (
  id SERIAL PRIMARY KEY NOT NULL,
  "description" TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL
);

CREATE TABLE "public"."Number" (
  id SERIAL PRIMARY KEY NOT NULL,
  "description" TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL
);

CREATE TABLE "public"."Gender" (
  id SERIAL PRIMARY KEY NOT NULL,
  "description" TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL
);

CREATE TABLE "public"."Degree" (
  id SERIAL PRIMARY KEY NOT NULL,
  "description" TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL
);

CREATE TABLE "public"."Word" (
  id SERIAL PRIMARY KEY NOT NULL,
  code TEXT NOT NULL,
  "text" TEXT NOT NULL,
  word TEXT NOT NULL,
  normalized TEXT NOT NULL,
  "verseId" INTEGER NOT NULL,
  "paragraphId" INTEGER NOT NULL,
  "lemmaId" INTEGER NOT NULL
  "speechId" INTEGER NOT NULL,
  "personId" INTEGER,
  "tenseId" INTEGER,
  "voiceId" INTEGER,
  "moodId" INTEGER,
  "caseId" INTEGER,
  "numberId" INTEGER,
  "genderId" INTEGER,
  "degreeId" INTEGER,
  FOREIGN KEY ("verseId") REFERENCES "public"."Verse"(id),
  FOREIGN KEY ("paragraphId") REFERENCES "public"."Paragraph"(id),
  FOREIGN KEY ("lemmaId") REFERENCES "public"."Lemma"(id),
  FOREIGN KEY ("speechId") REFERENCES "public"."Speech"(id),
  FOREIGN KEY ("personId") REFERENCES "public"."Person"(id),
  FOREIGN KEY ("tenseId") REFERENCES "public"."Tense"(id),
  FOREIGN KEY ("voiceId") REFERENCES "public"."Voice"(id),
  FOREIGN KEY ("moodId") REFERENCES "public"."Mood"(id),
  FOREIGN KEY ("caseId") REFERENCES "public"."Case"(id),
  FOREIGN KEY ("numberId") REFERENCES "public"."Number"(id),
  FOREIGN KEY ("genderId") REFERENCES "public"."Gender"(id),
  FOREIGN KEY ("degreeId") REFERENCES "public"."Degree"(id)
);

CREATE VIEW "Text" AS
    SELECT
	"Word".id, "Word"."verseId", "Word"."paragraphId", "Word".text, "Lemma".title AS lemma, "Speech".code AS "speech",
	CONCAT(COALESCE("Person".code, '-'), COALESCE("Tense".code, '-'), COALESCE("Voice".code, '-'), COALESCE("Mood".code, '-'), COALESCE("Case".code, '-'), COALESCE("Number".code, '-'), COALESCE("Gender".code, '-'), COALESCE("Degree".code, '-')) AS parsing
	FROM "Word"
	INNER JOIN "Speech" ON "Word"."speechId" = "Speech".id
	LEFT JOIN "Person" ON "Word"."personId" = "Person".id
	LEFT JOIN "Tense" ON "Word"."tenseId" = "Tense".id
	LEFT JOIN "Voice" ON "Word"."voiceId" = "Voice".id
	LEFT JOIN "Mood" ON "Word"."moodId" = "Mood".id
	LEFT JOIN "Case" ON "Word"."caseId" = "Case".id
	LEFT JOIN "Number" ON "Word"."numberId" = "Number".id
	LEFT JOIN "Gender" ON "Word"."genderId" = "Gender".id
	LEFT JOIN "Degree" ON "Word"."degreeId" = "Degree".id
	LEFT JOIN "Lemma" ON "Word"."lemmaId" = "Lemma".id
	ORDER BY "Word".id