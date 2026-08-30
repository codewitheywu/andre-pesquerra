# Database

## Fresh setup

1. Create an empty database (name must match `DB_NAME`, default `portfolio_db`):
   ```
   mysql -u root -e "CREATE DATABASE portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```
2. Import the schema:
   ```
   mysql -u root portfolio_db < database/schema.sql
   ```
3. Create the first CMS admin account. Generate a bcrypt hash for your chosen password — **never store the plaintext password anywhere**:
   ```
   php -r "echo password_hash('your-real-password-here', PASSWORD_DEFAULT), PHP_EOL;"
   ```
   Then insert the account using that hash (replace the placeholders):
   ```sql
   INSERT INTO cms_users (username, email, password_hash, role)
   VALUES ('admin', 'you@example.com', '<paste the hash from above>', 'admin');
   ```
4. Fill in your profile, skills, experience, etc. through the CMS at `/cms/login.php`.

## Deploying to a new host

The app auto-detects its own base URL and subfolder from the request (see `includes/url.php`) — you do **not** need to edit any PHP file to move it. Instead, set these environment variables on the new host:

| Variable | Purpose | Local WAMP default |
|---|---|---|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_NAME` | Database name | `portfolio_db` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASS` | MySQL password | *(empty)* |
| `APP_ENV` | `production` on a live host | `local` (shows PHP errors — never set this on a live site) |

Then import `database/schema.sql` into the new database and create an admin account as above.

### If you're relocating an existing site (not a fresh install)

Image/file URLs already saved in the database from before this fix were stored with the old hardcoded `/portfolio/` prefix. Moving to a different subfolder (or a domain root) requires a one-time update of those stored URLs — run this **once**, after confirming the new location, adjusting the replacement target to match (use `''` if moving to a domain root):

```sql
UPDATE profile         SET avatar_url    = REPLACE(avatar_url,    '/portfolio/', '/new-path/');
UPDATE skills           SET icon_url      = REPLACE(icon_url,      '/portfolio/', '/new-path/');
UPDATE work_experience  SET logo_url      = REPLACE(logo_url,      '/portfolio/', '/new-path/');
UPDATE education        SET logo_url      = REPLACE(logo_url,      '/portfolio/', '/new-path/');
UPDATE projects         SET thumbnail_url = REPLACE(thumbnail_url, '/portfolio/', '/new-path/');
UPDATE project_images   SET image_url     = REPLACE(image_url,     '/portfolio/', '/new-path/');
UPDATE testimonials     SET avatar_url    = REPLACE(avatar_url,    '/portfolio/', '/new-path/');
```

New uploads made after the move will automatically get correct URLs — this migration only matters for files uploaded before the move.

## Keeping schema.sql in sync

If you add/change a table or column directly in the database, re-export the schema so it stays the reproducible source of truth:

```
mysqldump -u root --no-data --routines --triggers --skip-comments portfolio_db > database/schema.sql
```
