-- Migrate users data to better_auth_users table
INSERT INTO "better_auth_users" (
  "id",
  "email", 
  "name",
  "password",
  "role",
  "is_active",
  "auth_provider",
  "email_verified",
  "created_at",
  "updated_at"
)
SELECT 
  "id",
  "email",
  "name", 
  "password",
  "role",
  "is_active",
  'email' as "auth_provider",
  true as "email_verified",
  "created_at",
  "updated_at"
FROM "users"
ON CONFLICT ("email") DO NOTHING; 