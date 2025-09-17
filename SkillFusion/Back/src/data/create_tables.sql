BEGIN;

DROP TABLE IF EXISTS
"response",
"question",
"users_has_favorites",
"material",
"step",
"lesson",
"category",
"users",
"role"
CASCADE;

-- Table: Role
CREATE TABLE role (
  "id" SERIAL PRIMARY KEY,
  "description" VARCHAR(50) NOT NULL
);

-- Table: Users
CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "pseudo" VARCHAR(100) NOT NULL,
  "password" VARCHAR(100) NOT NULL, 
  "mail" VARCHAR(100) NOT NULL,
  "role_id" INTEGER NOT NULL,
  FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE
);

-- Table: Category
CREATE TABLE "category" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(110) UNIQUE NOT NULL
);

-- Table: Lesson
CREATE TABLE "lesson" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) UNIQUE,
  "text" TEXT,
  "media" TEXT,
  "category_id" INTEGER NOT NULL,
  "users_id" INTEGER NOT NULL,
  FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE,
  FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Table: Step
CREATE TABLE "step" (
  "id" SERIAL PRIMARY KEY,
  "step_order" INTEGER NOT NULL,
  "title" VARCHAR(256),
  "description" TEXT,
  "media" TEXT,
  "lesson_id" INTEGER NOT NULL,
  FOREIGN KEY ("lesson_id") REFERENCES "lesson"("id") ON DELETE CASCADE
);

-- Table: Material
CREATE TABLE "material" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(256),
  "lesson_id" INTEGER NOT NULL,
  FOREIGN KEY ("lesson_id") REFERENCES "lesson"("id") ON DELETE CASCADE
);

-- Table: User_has_favorites
CREATE TABLE "users_has_favorites" (
  "id" SERIAL PRIMARY KEY,
  "users_id" INTEGER NOT NULL,
  "lesson_id" INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE,
  FOREIGN KEY ("lesson_id") REFERENCES "lesson"("id") ON DELETE CASCADE
  );

-- Table: Question
CREATE TABLE "question" (
  "id" SERIAL PRIMARY KEY,
  "text" TEXT NOT NULL,
  "users_id" INTEGER NOT NULL,
  FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Table: Response
CREATE TABLE "response" (
  "id" SERIAL PRIMARY KEY,
  "text" TEXT NOT NULL,
  "question_id" INTEGER NOT NULL,
  "users_id" INTEGER NOT NULL,
  FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE CASCADE,
  FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE
);

COMMIT;