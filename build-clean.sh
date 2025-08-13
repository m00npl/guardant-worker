#!/bin/bash

# Clean build script for GuardAnt Worker without pino

echo "🧹 Cleaning and rebuilding worker..."

# Remove old builds
rm -rf dist/

# Create dist directory
mkdir -p dist

# Build with esbuild, replacing pino imports
cat > /tmp/build-worker.js << 'EOF'
const esbuild = require('esbuild');
const fs = require('fs');

// Plugin to replace pino imports with simple logger
const replaceLoggerPlugin = {
  name: 'replace-logger',
  setup(build) {
    build.onResolve({ filter: /^\.\/logger$/ }, args => {
      return { path: require.resolve('./src/simple-logger.ts') };
    });
    build.onResolve({ filter: /^pino$/ }, args => {
      return { path: require.resolve('./src/simple-logger.ts') };
    });
  }
};

esbuild.build({
  entryPoints: ['./src/auto-geographic-worker.ts', './src/geographic-worker.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outdir: 'dist',
  format: 'esm',
  external: [],
  plugins: [replaceLoggerPlugin],
  define: {
    'process.env.NODE_ENV': '"production"'
  }
}).then(() => {
  console.log('✅ Build complete');
}).catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
EOF

# Run the build
node /tmp/build-worker.js

echo "✅ Clean build complete!"