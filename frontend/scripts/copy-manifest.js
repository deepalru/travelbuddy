const fs = require('fs');
const path = require('path');

const distAssets = path.join(__dirname, '../dist/assets');
const distRoot = path.join(__dirname, '../dist');

// Find the manifest-*.json file
const files = fs.readdirSync(distAssets);
const manifestFile = files.find(f => f.startsWith('manifest-') && f.endsWith('.json'));

if (manifestFile) {
  const src = path.join(distAssets, manifestFile);
  const dest = path.join(distRoot, 'manifest.json');
  fs.copyFileSync(src, dest);
  console.log(`Copied ${manifestFile} to dist/manifest.json`);
} else {
  console.error('No manifest-*.json found in dist/assets');
  process.exit(1);
} 