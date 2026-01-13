// Workaround pentru problema node:sea pe Windows
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Creează directorul .expo/metro/externals dacă nu există
const externalsDir = path.join(__dirname, '.expo', 'metro', 'externals');
if (!fs.existsSync(externalsDir)) {
  fs.mkdirSync(externalsDir, { recursive: true });
}

// Creează un symlink sau director alternativ pentru node:sea
// Pe Windows, nu putem crea directoare cu ':' în nume, deci creăm un director alternativ
const nodeSeaDir = path.join(externalsDir, 'node-sea');
if (!fs.existsSync(nodeSeaDir)) {
  try {
    fs.mkdirSync(nodeSeaDir, { recursive: true });
  } catch (err) {
    // Dacă nu poate crea, ignoră
    console.warn('Could not create node-sea directory, continuing...');
  }
}

// Patch pentru a intercepta fs.mkdirSync și a preveni crearea directorului node:sea
const originalMkdirSync = fs.mkdirSync;
fs.mkdirSync = function(path, options) {
  // Dacă path-ul conține 'node:sea', înlocuiește-l cu 'node-sea'
  if (typeof path === 'string' && path.includes('node:sea')) {
    const fixedPath = path.replace(/node:sea/g, 'node-sea');
    console.warn(`Preventing creation of directory with ':' in name: ${path} -> ${fixedPath}`);
    return originalMkdirSync.call(this, fixedPath, options);
  }
  return originalMkdirSync.call(this, path, options);
};

// Găsește expo CLI
const expoPath = path.join(__dirname, 'node_modules', '.bin', 'expo.cmd');
const args = process.argv.slice(2);

const child = spawn(expoPath, args, {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    EXPO_NO_NODE_EXTERNALS: '1'
  }
});

child.on('exit', (code) => {
  process.exit(code);
});
