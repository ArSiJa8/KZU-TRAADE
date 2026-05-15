import http from 'node:http';
import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as Sentry from '@sentry/node';

// --- Sentry Initialization ---
Sentry.init({
  dsn: "https://0533b755b850010215bd4e2b6639437c@o4511388675866624.ingest.de.sentry.io/4511388683141200",
  tracesSampleRate: 1.0,
});

const PORT = 9000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEPLOY_SCRIPT = path.join(__dirname, 'deploy.sh');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/deploy') {
    console.log('--- Deployment Triggered via Webhook ---');
    
    Sentry.captureMessage('Deployment started');

    exec(`bash ${DEPLOY_SCRIPT}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Deployment failed: ${error.message}`);
        console.error(stderr);
        Sentry.captureException(error, {
          extra: { stderr, stdout }
        });
        
        res.writeHead(500);
        res.end('Deployment failed');
        return;
      }
      
      console.log('Deployment successful');
      console.log(stdout);
      Sentry.captureMessage('Deployment successful');
      
      res.writeHead(200);
      res.end('Deployment successful');
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Deploy listener running on port ${PORT}`);
  console.log(`Deployment script path: ${DEPLOY_SCRIPT}`);
});
