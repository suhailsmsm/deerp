-- Create social media posts table
CREATE TABLE "posts" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "title" TEXT NOT NULL,
  "caption" TEXT NOT NULL,
  "media_url" TEXT,
  "hashtags" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Draft',
  "created_by" INTEGER NOT NULL,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create connected social platforms table
CREATE TABLE "platforms" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "access_token" TEXT NOT NULL,
  "page_id" TEXT
);

-- Create post scheduling + publishing table
CREATE TABLE "post_platforms" (
  "post_id" INTEGER NOT NULL,
  "platform_id" INTEGER NOT NULL,
  "scheduled_at" DATETIME,
  "published_at" DATETIME,
  "status" TEXT NOT NULL DEFAULT 'Draft',
  "error_log" TEXT,
  "reach" INTEGER NOT NULL DEFAULT 0,
  "likes" INTEGER NOT NULL DEFAULT 0,
  "comments" INTEGER NOT NULL DEFAULT 0,
  "shares" INTEGER NOT NULL DEFAULT 0,
  "timezone" TEXT NOT NULL DEFAULT 'UTC',
  PRIMARY KEY ("post_id", "platform_id"),
  CONSTRAINT "post_platforms_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "post_platforms_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
