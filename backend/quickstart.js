const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Initialize Strapi with minimal setup
try {
  console.log('Setting up Strapi CMS...');
  
  // Create basic Strapi structure if not exists
  const strapiPath = path.join(__dirname);
  
  // Initialize package.json if needed
  if (!fs.existsSync(path.join(strapiPath, 'node_modules'))) {
    console.log('Installing Strapi dependencies...');
    execSync('npm install --legacy-peer-deps', { cwd: strapiPath, stdio: 'inherit' });
  }
  
  // Build admin panel
  console.log('Building Strapi admin panel...');
  execSync('npx strapi build --no-optimization', { cwd: strapiPath, stdio: 'inherit' });
  
  console.log('✅ Strapi setup complete');
  console.log('Run: cd backend && npx strapi develop');
  
} catch (error) {
  console.error('Setup failed:', error.message);
}