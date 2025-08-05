const esbuild = require('esbuild');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

async function build() {
  try {
    await esbuild.build({
      entryPoints: ['./src/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      outfile: 'dist/bundle.js',
      minify: true,
      sourcemap: false,
      format: 'cjs',
      banner: {
        js: '#!/usr/bin/env node\n',
      },
      external: [
        'systeminformation',
        'socket.io-client',
        'pino-pretty'
      ],
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    });
    console.log('Build complete');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();