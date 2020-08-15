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

CREATE TABLE "public"."Lemma" (
  id SERIAL PRIMARY KEY NOT NULL,
  title TEXT UNIQUE NOT NULL
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
