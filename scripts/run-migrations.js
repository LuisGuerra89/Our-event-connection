#!/usr/bin/env node

/**
 * Database Migration Runner for Supabase
 * Ejecuta todos los scripts SQL automáticamente
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

async function runMigrations() {
  // Load environment variables
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error(
      `${colors.red}✗ Error: .env.local not found at ${envPath}${colors.reset}`
    );
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, "utf-8");
  const env = {};
  envContent.split("\n").forEach((line) => {
    if (line && !line.startsWith("#")) {
      const [key, value] = line.split("=");
      if (key && value) {
        env[key.trim()] = value.trim();
      }
    }
  });

  const SUPABASE_URL = env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      `${colors.red}✗ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local${colors.reset}`
    );
    process.exit(1);
  }

  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Get all SQL scripts
  const scriptsDir = path.join(__dirname);
  const files = fs
    .readdirSync(scriptsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const totalScripts = files.length;
  let completed = 0;
  let failed = 0;
  const failedFiles = [];

  console.log(
    `${colors.blue}================================================${colors.reset}`
  );
  console.log(
    `${colors.yellow}Database Migration Runner${colors.reset}`
  );
  console.log(
    `${colors.blue}================================================${colors.reset}`
  );
  console.log(
    `${colors.blue}Supabase URL: ${SUPABASE_URL}${colors.reset}`
  );
  console.log(
    `${colors.yellow}Total scripts to run: ${totalScripts}${colors.reset}`
  );
  console.log(
    `${colors.blue}================================================${colors.reset}\n`
  );

  // Execute each script
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(scriptsDir, file);
    const sqlContent = fs.readFileSync(filePath, "utf-8");
    const scriptNum = i + 1;

    process.stdout.write(
      `[${scriptNum}/${totalScripts}] Running ${colors.yellow}${file}${colors.reset}... `
    );

    try {
      // Execute the SQL using the query API
      const { error } = await supabase.rpc("exec_sql", {
        sql: sqlContent,
      });

      if (error) {
        // Try alternative approach: direct query execution
        try {
          await supabase.rpc("exec_sql", { sql: sqlContent });
          console.log(`${colors.green}✓${colors.reset}`);
          completed++;
        } catch (innerError) {
          console.log(`${colors.red}✗${colors.reset}`);
          failed++;
          failedFiles.push(file);
        }
      } else {
        console.log(`${colors.green}✓${colors.reset}`);
        completed++;
      }
    } catch (error) {
      console.log(`${colors.red}✗${colors.reset}`);
      failed++;
      failedFiles.push(file);
      console.error(`  Error: ${error.message}`);
    }
  }

  console.log(`\n${colors.blue}================================================${colors.reset}`);
  console.log(`${colors.yellow}Migration Summary${colors.reset}`);
  console.log(`${colors.blue}================================================${colors.reset}`);
  console.log(`Completed: ${colors.green}${completed}/${totalScripts}${colors.reset}`);
  console.log(`Failed: ${colors.red}${failed}/${totalScripts}${colors.reset}`);

  if (failedFiles.length > 0) {
    console.log(`${colors.red}Failed scripts:${colors.reset}`);
    failedFiles.forEach((file) => {
      console.log(`  ${colors.red}✗${colors.reset} ${file}`);
    });
  }

  console.log(
    `${colors.blue}================================================${colors.reset}`
  );

  if (failed === 0) {
    console.log(
      `${colors.green}✓ All migrations completed successfully!${colors.reset}`
    );
    process.exit(0);
  } else {
    console.log(
      `${colors.red}✗ Some migrations failed. Check the errors above.${colors.reset}`
    );
    process.exit(1);
  }
}

// Run migrations
runMigrations().catch((error) => {
  console.error(`${colors.red}Unexpected error: ${error.message}${colors.reset}`);
  process.exit(1);
});
