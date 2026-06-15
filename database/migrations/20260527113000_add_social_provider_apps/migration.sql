CREATE TABLE "social_provider_apps" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "platform" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "client_secret" TEXT NOT NULL,
  "redirect_uri" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "social_provider_apps_platform_key" ON "social_provider_apps"("platform");
