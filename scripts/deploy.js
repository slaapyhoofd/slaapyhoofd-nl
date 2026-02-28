import { Client } from 'basic-ftp';
import { config } from 'dotenv';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

config();

const FTP_CONFIG = {
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASS,
  remotePath: process.env.FTP_PATH || '/slaapyhoofd.nl',
};

async function deploy() {
  const client = new Client();
  client.ftp.verbose = true;

  try {
    console.log('🚀 Starting deployment...');
    console.log(`📡 Connecting to ${FTP_CONFIG.host}...`);
    
    await client.access({
      host: FTP_CONFIG.host,
      user: FTP_CONFIG.user,
      password: FTP_CONFIG.password,
      secure: false,
    });

    console.log('✅ Connected to FTP server');

    // Ensure remote directory exists
    await client.ensureDir(FTP_CONFIG.remotePath);
    await client.cd(FTP_CONFIG.remotePath);

    // Upload dist folder (built frontend)
    console.log('📦 Uploading frontend files...');
    await client.uploadFromDir('./dist', '/');

    // Upload API folder (PHP backend)
    console.log('📦 Uploading API files...');
    await client.uploadFromDir('./api', '/api');

    // Upload .htaccess if exists
    try {
      await client.uploadFrom('./.htaccess', '/.htaccess');
      console.log('✅ Uploaded .htaccess');
    } catch (e) {
      console.log('⚠️  No .htaccess file found');
    }

    console.log('✅ Deployment completed successfully!');
  } catch (err) {
    console.error('❌ Deployment failed:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
