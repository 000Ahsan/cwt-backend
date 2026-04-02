const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const distPath = path.join(__dirname, '..', 'dist');
const schemaPath = path.join(distPath, 'prisma', 'schema.prisma');

// Read the schema and temporarily add output path
const original = fs.readFileSync(schemaPath, 'utf8');
const patched = original.replace(
    'provider = "prisma-client-js"',
    'provider = "prisma-client-js"\n  output   = "../node_modules/@prisma/client"'
);
fs.writeFileSync(schemaPath, patched);

console.log('Running npm install in dist...');
execSync('npm install --omit=dev', { cwd: distPath, stdio: 'inherit' });

console.log('Generating Prisma client inside dist...');
execSync('npx prisma generate --schema=prisma/schema.prisma', {
    cwd: distPath,
    stdio: 'inherit'
});

// Restore original schema
fs.writeFileSync(schemaPath, original);

// Verify the client was generated correctly
const clientPath = path.join(distPath, 'node_modules', '@prisma', 'client');
const exists = fs.existsSync(path.join(clientPath, 'index.js'));
console.log(`\n✅ Prisma client exists at dist/node_modules/@prisma/client: ${exists}`);

console.log('\ndist/ is ready to upload!');