const fs = require("fs");
const path = require("path");

const MIGRATIONS_DIR = path.resolve(__dirname, "../../../database/migrations");


// Applies any .sql files in database/migrations that haven't been run yet,
// in filename order, recording each one in schema_migrations.
async function migrate(pool) {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            filename VARCHAR(255) PRIMARY KEY,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    const applied = await pool.query("SELECT filename FROM schema_migrations;");
    const appliedFiles = new Set(applied.rows.map((row) => row.filename));

    const files = fs.readdirSync(MIGRATIONS_DIR)
        .filter((file) => file.endsWith(".sql"))
        .sort();

    for (const file of files) {
        if (appliedFiles.has(file)) {
            continue;
        }

        const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
        const client = await pool.connect();

        try {
            await client.query("BEGIN");
            await client.query(sql);
            await client.query(
                "INSERT INTO schema_migrations (filename) VALUES ($1);",
                [file]
            );
            await client.query("COMMIT");

            console.log(`Applied migration ${file}`);
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = migrate;
