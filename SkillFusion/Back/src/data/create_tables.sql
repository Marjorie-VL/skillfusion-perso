BEGIN;

DROP TABLE IF EXISTS
"topic",
"reply",
"favorite",
"material",
"step",
"lesson",
"category",
"user",
"role"
CASCADE;

-- Table: Role
CREATE TABLE role (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL
);

-- Table: User
CREATE TABLE "user" (
  "id" SERIAL PRIMARY KEY,
  "user_name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(100) NOT NULL,
  "password" VARCHAR(255) NOT NULL, 
  "role_id" INTEGER NOT NULL,
  FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE
);

-- Table: Category
CREATE TABLE "category" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) UNIQUE NOT NULL
);

-- Table: Lesson
CREATE TABLE "lesson" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) UNIQUE,
  "description" TEXT,
  "is_published" BOOLEAN DEFAULT FALSE,
  "media_url" TEXT,
  "media_alt" TEXT NOT NULL,
  "category_id" INTEGER NOT NULL,
  "user_id" INTEGER NOT NULL,
  FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE,
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Table: Step
CREATE TABLE "step" (
  "id" SERIAL PRIMARY KEY,
  "step_order" INTEGER NOT NULL,
  "title" VARCHAR(255),
  "description" TEXT,
  "media_url" TEXT,
  "media_alt" TEXT NOT NULL,
  "lesson_id" INTEGER NOT NULL,
  FOREIGN KEY ("lesson_id") REFERENCES "lesson"("id") ON DELETE CASCADE
);

-- Table: Material
CREATE TABLE "material" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255),
  "quantity" INTEGER,
  "lesson_id" INTEGER NOT NULL,
  FOREIGN KEY ("lesson_id") REFERENCES "lesson"("id") ON DELETE CASCADE
);

-- Table: favorite
CREATE TABLE "favorite" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "lesson_id" INTEGER NOT NULL,
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE,
  FOREIGN KEY ("lesson_id") REFERENCES "lesson"("id") ON DELETE CASCADE
  );

-- Table: topic
CREATE TABLE "topic" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "content" TEXT NOT NULL,
  "user_id" INTEGER NOT NULL,
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Table: Reply
CREATE TABLE "reply" (
  "id" SERIAL PRIMARY KEY,
  "content" TEXT NOT NULL,
  "topic_id" INTEGER NOT NULL,
  "user_id" INTEGER NOT NULL,
  FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE CASCADE,
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
);

COMMIT;