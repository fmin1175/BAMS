// Script to remove all Prisma migration files and create a new baseline migration
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to migrations directory
const migrationsDir = path.join(__dirname, 'prisma', 'migrations');

// Check if migrations directory exists
if (!fs.existsSync(migrationsDir)) {
  console.log('Migrations directory does not exist.');
  process.exit(1);
}

console.log('Starting clean migration process...');
console.log('1. Backing up schema.prisma...');

// Backup the current schema.prisma file
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
const schemaBackupPath = path.join(__dirname, 'prisma', 'schema.prisma.backup');

if (!fs.existsSync(schemaPath)) {
  console.log('schema.prisma file not found!');
  process.exit(1);
}

fs.copyFileSync(schemaPath, schemaBackupPath);
console.log('Schema backup created at: ' + schemaBackupPath);

// Get all migration folders
const migrationFolders = fs.readdirSync(migrationsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log(`2. Found ${migrationFolders.length} migration folders to remove.`);

// Remove each migration folder
migrationFolders.forEach(folder => {
  const folderPath = path.join(migrationsDir, folder);
  console.log(`   Removing migration folder: ${folder}`);
  fs.rmSync(folderPath, { recursive: true, force: true });
});

// Keep migration_lock.toml but update it
const lockFilePath = path.join(migrationsDir, 'migration_lock.toml');
if (fs.existsSync(lockFilePath)) {
  console.log('3. Updating migration_lock.toml');
  fs.writeFileSync(lockFilePath, 'provider = "postgresql"\n');
}

console.log('4. All migration folders have been removed.');

// Create a new baseline migration
console.log('5. Creating new baseline migration...');
console.log('');
console.log('NEXT STEPS:');
console.log('1. Run the following command to create a new baseline migration:');
console.log('   npx prisma migrate dev --name "baseline"');
console.log('');
console.log('2. This will create a single migration that represents your current schema');
console.log('');
console.log('NOTE: Your current database structure remains unchanged.');
console.log('If you encounter any issues, you can restore the schema from the backup.');