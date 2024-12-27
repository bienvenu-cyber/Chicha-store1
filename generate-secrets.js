const crypto = import('crypto');
const fs = import('fs');
const path = import('path');

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function generateEnvFile() {
  const secrets = {
    JWT_SECRET: generateSecret(),
    ENCRYPTION_KEY: generateSecret(),
    STRIPE_SECRET_KEY: `sk_test_${generateSecret(16)}`,
    STRIPE_PUBLISHABLE_KEY: `pk_test_${generateSecret(16)}`
  };

  const envContent = Object.entries(secrets)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const envPath = path.resolve(__dirname, '.env.secrets');
  fs.writeFileSync(envPath, envContent);
  
  console.log('🔐 Secrets générés avec succès dans .env.secrets');
  console.log('🚨 ATTENTION : Gardez ce fichier PRIVÉ et NE le commitez PAS !');
}

generateEnvFile();
