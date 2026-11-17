import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function start() {
  const server = await createServer({
    root: __dirname,
    configFile: path.join(__dirname, 'vite.config.js'),
    server: {
      host: '0.0.0.0',
      port: 5173,
    }
  });

  await server.listen();
  console.log('\n  VITE DEV SERVER RUNNING');
  console.log('  ➜  Local:   http://localhost:5173/');
  console.log('  ➜  Network: http://127.0.0.1:5173/\n');
}

start().catch((err) => {
  console.error('Failed to start Vite dev server:', err);
  process.exit(1);
});
