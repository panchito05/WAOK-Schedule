#!/usr/bin/env node

/**
 * Setup script for Cross-Browser Testing
 * Validates environment, installs dependencies, and configures testing tools
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

class CrossBrowserSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.errors = [];
    this.warnings = [];
    this.success = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'
    };

    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async validateEnvironment() {
    this.log('🔍 Validating environment...', 'info');

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 16) {
      this.errors.push(`Node.js version ${nodeVersion} is too old. Minimum required: 16.x`);
    } else {
      this.success.push(`Node.js version ${nodeVersion} ✓`);
    }

    // Check package.json
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      this.errors.push('package.json not found in project root');
    } else {
      this.success.push('package.json found ✓');
    }

    // Check if npm is available
    try {
      execSync('npm --version', { stdio: 'ignore' });
      this.success.push('npm is available ✓');
    } catch {
      this.errors.push('npm is not available or not in PATH');
    }

    // Check operating system
    const platform = os.platform();
    this.log(`Operating System: ${platform}`, 'info');
    
    if (platform === 'win32') {
      this.warnings.push('Windows detected. Some browsers may require additional setup.');
    }
  }

  checkEnvironmentVariables() {
    this.log('🔧 Checking environment variables...', 'info');

    const envPath = path.join(this.projectRoot, '.env');
    const envExamplePath = path.join(this.projectRoot, '.env.example');

    if (!fs.existsSync(envPath)) {
      if (fs.existsSync(envExamplePath)) {
        this.warnings.push('.env file not found. Copy .env.example to .env and configure credentials.');
        this.copyEnvExample();
      } else {
        this.errors.push('.env.example file not found. Cannot create .env template.');
      }
    } else {
      this.validateEnvFile(envPath);
    }
  }

  copyEnvExample() {
    try {
      const envExamplePath = path.join(this.projectRoot, '.env.example');
      const envPath = path.join(this.projectRoot, '.env');
      
      fs.copyFileSync(envExamplePath, envPath);
      this.success.push('.env file created from .env.example ✓');
      this.log('📝 Please edit .env file and add your BrowserStack/Sauce Labs credentials', 'warning');
    } catch (error) {
      this.errors.push(`Failed to copy .env.example: ${error.message}`);
    }
  }

  validateEnvFile(envPath) {
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const requiredVars = [
        'BASE_URL',
        'TEST_TIMEOUT',
        'WORKERS'
      ];

      const optionalVars = [
        'BROWSERSTACK_USERNAME',
        'BROWSERSTACK_ACCESS_KEY',
        'SAUCE_USERNAME',
        'SAUCE_ACCESS_KEY'
      ];

      let hasCloudProvider = false;

      requiredVars.forEach(varName => {
        if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your_`)) {
          this.success.push(`${varName} configured ✓`);
        } else {
          this.warnings.push(`${varName} not properly configured`);
        }
      });

      // Check for at least one cloud provider
      if ((envContent.includes('BROWSERSTACK_USERNAME=') && !envContent.includes('BROWSERSTACK_USERNAME=your_')) ||
          (envContent.includes('SAUCE_USERNAME=') && !envContent.includes('SAUCE_USERNAME=your_'))) {
        hasCloudProvider = true;
        this.success.push('Cloud testing provider configured ✓');
      } else {
        this.warnings.push('No cloud testing provider configured. Tests will run locally only.');
      }

    } catch (error) {
      this.errors.push(`Failed to read .env file: ${error.message}`);
    }
  }

  async installDependencies() {
    this.log('📦 Installing dependencies...', 'info');

    const dependencies = [
      '@playwright/test',
      'browserstack-local',
      '@saucelabs/sauce-connect-proxy'
    ];

    try {
      // Check if dependencies are already installed
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'));
      const installedDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const missingDeps = dependencies.filter(dep => !installedDeps[dep]);
      
      if (missingDeps.length > 0) {
        this.log(`Installing missing dependencies: ${missingDeps.join(', ')}`, 'info');
        execSync(`npm install --save-dev ${missingDeps.join(' ')}`, { stdio: 'inherit' });
        this.success.push('Dependencies installed ✓');
      } else {
        this.success.push('All dependencies already installed ✓');
      }
    } catch (error) {
      this.errors.push(`Failed to install dependencies: ${error.message}`);
    }
  }

  async installBrowsers() {
    this.log('🌐 Installing Playwright browsers...', 'info');

    try {
      execSync('npx playwright install', { stdio: 'inherit' });
      this.success.push('Playwright browsers installed ✓');
    } catch (error) {
      this.warnings.push(`Failed to install browsers: ${error.message}`);
      this.log('You may need to install browsers manually: npx playwright install', 'warning');
    }
  }

  validateConfiguration() {
    this.log('⚙️ Validating configuration files...', 'info');

    const configFiles = [
      'playwright.cross-browser.config.ts',
      'browserstack.config.ts',
      'saucelabs.config.ts',
      'cross-browser-setup.ts',
      'cross-browser-teardown.ts'
    ];

    configFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        this.success.push(`${file} found ✓`);
      } else {
        this.errors.push(`${file} not found`);
      }
    });
  }

  createDirectories() {
    this.log('📁 Creating required directories...', 'info');

    const directories = [
      'cross-browser-reports',
      'cross-browser-reports/html',
      'cross-browser-reports/json',
      'cross-browser-reports/junit',
      'cross-browser-reports/screenshots',
      'cross-browser-reports/videos'
    ];

    directories.forEach(dir => {
      const dirPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        this.success.push(`Created directory: ${dir} ✓`);
      } else {
        this.success.push(`Directory exists: ${dir} ✓`);
      }
    });
  }

  runDiagnosticTest() {
    this.log('🧪 Running diagnostic test...', 'info');

    try {
      // Run a simple test to verify setup
      execSync('npx playwright test --list --config=playwright.cross-browser.config.ts', { stdio: 'pipe' });
      this.success.push('Configuration validation passed ✓');
    } catch (error) {
      this.warnings.push('Configuration validation failed. Check your config files.');
    }
  }

  generateReport() {
    this.log('📊 Generating setup report...', 'info');

    const report = {
      timestamp: new Date().toISOString(),
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        npmVersion: this.getNpmVersion()
      },
      results: {
        success: this.success,
        warnings: this.warnings,
        errors: this.errors
      }
    };

    const reportPath = path.join(this.projectRoot, 'cross-browser-reports', 'setup-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.success.push(`Setup report saved to: ${reportPath}`);
  }

  getNpmVersion() {
    try {
      return execSync('npm --version', { encoding: 'utf8' }).trim();
    } catch {
      return 'unknown';
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 CROSS-BROWSER TESTING SETUP SUMMARY');
    console.log('='.repeat(60));

    if (this.success.length > 0) {
      this.log(`\n✅ SUCCESS (${this.success.length}):`, 'success');
      this.success.forEach(msg => console.log(`   • ${msg}`));
    }

    if (this.warnings.length > 0) {
      this.log(`\n⚠️  WARNINGS (${this.warnings.length}):`, 'warning');
      this.warnings.forEach(msg => console.log(`   • ${msg}`));
    }

    if (this.errors.length > 0) {
      this.log(`\n❌ ERRORS (${this.errors.length}):`, 'error');
      this.errors.forEach(msg => console.log(`   • ${msg}`));
    }

    console.log('\n' + '='.repeat(60));
    
    if (this.errors.length === 0) {
      this.log('🚀 Setup completed! You can now run cross-browser tests.', 'success');
      console.log('\nNext steps:');
      console.log('1. Configure .env with your credentials');
      console.log('2. Run: npm run test:cross-browser');
      console.log('3. View reports in cross-browser-reports/ directory');
    } else {
      this.log('❌ Setup incomplete. Please fix the errors above.', 'error');
      process.exit(1);
    }
  }

  async run() {
    console.log('🔧 WAOK-Schedule Cross-Browser Testing Setup');
    console.log('='.repeat(50));

    await this.validateEnvironment();
    this.checkEnvironmentVariables();
    this.createDirectories();
    await this.installDependencies();
    await this.installBrowsers();
    this.validateConfiguration();
    this.runDiagnosticTest();
    this.generateReport();
    this.printSummary();
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new CrossBrowserSetup();
  setup.run().catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

module.exports = CrossBrowserSetup;