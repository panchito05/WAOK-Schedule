#!/usr/bin/env node

/**
 * Cross-Browser Testing Setup Validation Script
 * Validates that all required files and configurations are in place
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    log(`✗ ${description} (Missing: ${filePath})`, 'red');
    return false;
  }
}

function checkDirectoryExists(dirPath, description) {
  const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  if (exists) {
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    log(`✗ ${description} (Missing: ${dirPath})`, 'red');
    return false;
  }
}

function validatePackageJson() {
  const packageJsonPath = './package.json';
  if (!fs.existsSync(packageJsonPath)) {
    log('✗ package.json not found', 'red');
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const scripts = packageJson.scripts || {};
    
    // Check for cross-browser test scripts
    const expectedScripts = [
      'test:cross-browser',
      'test:browserstack',
      'test:saucelabs',
      'test:chrome',
      'test:firefox',
      'test:safari',
      'test:edge'
    ];
    
    let allScriptsPresent = true;
    expectedScripts.forEach(script => {
      if (scripts[script]) {
        log(`✓ Script '${script}' found`, 'green');
      } else {
        log(`✗ Script '${script}' missing`, 'red');
        allScriptsPresent = false;
      }
    });
    
    return allScriptsPresent;
  } catch (error) {
    log(`✗ Error reading package.json: ${error.message}`, 'red');
    return false;
  }
}

function validateConfigFiles() {
  const configFiles = [
    {
      path: './playwright.cross-browser.config.ts',
      description: 'Main cross-browser Playwright configuration'
    },
    {
      path: './browserstack.config.ts',
      description: 'BrowserStack configuration'
    },
    {
      path: './saucelabs.config.ts',
      description: 'Sauce Labs configuration'
    },
    {
      path: './cross-browser-setup.ts',
      description: 'Cross-browser global setup'
    },
    {
      path: './cross-browser-teardown.ts',
      description: 'Cross-browser global teardown'
    }
  ];
  
  let allFilesPresent = true;
  configFiles.forEach(file => {
    if (!checkFileExists(file.path, file.description)) {
      allFilesPresent = false;
    }
  });
  
  return allFilesPresent;
}

function validateTestFiles() {
  const testDir = './client/src/tests/e2e';
  if (!checkDirectoryExists(testDir, 'E2E test directory')) {
    return false;
  }
  
  const testFiles = [
    {
      path: './client/src/tests/e2e/cross-browser-validation.spec.ts',
      description: 'Cross-browser validation test'
    },
    {
      path: './tests/cross-browser/navigation.spec.ts',
      description: 'Cross-browser navigation test (optional)'
    },
    {
      path: './tests/cross-browser/forms.spec.ts',
      description: 'Cross-browser forms test (optional)'
    }
  ];
  
  let hasTestFiles = false;
  testFiles.forEach(file => {
    if (fs.existsSync(file.path)) {
      checkFileExists(file.path, file.description);
      hasTestFiles = true;
    }
  });
  
  return hasTestFiles;
}

function validateDocumentation() {
  const docFiles = [
    {
      path: './docs/cross-browser-testing.md',
      description: 'Cross-browser testing documentation'
    },
    {
      path: './.env.example',
      description: 'Environment variables example'
    }
  ];
  
  let allDocsPresent = true;
  docFiles.forEach(file => {
    if (!checkFileExists(file.path, file.description)) {
      allDocsPresent = false;
    }
  });
  
  return allDocsPresent;
}

function validateEnvironmentVariables() {
  log('\n' + colors.bold + 'Environment Variables Check:' + colors.reset);
  
  const requiredEnvVars = [
    'BROWSERSTACK_USERNAME',
    'BROWSERSTACK_ACCESS_KEY', 
    'SAUCE_USERNAME',
    'SAUCE_ACCESS_KEY'
  ];
  
  const optionalEnvVars = [
    'BASE_URL',
    'TEST_TIMEOUT',
    'MAX_FAILURES',
    'RETRIES',
    'WORKERS'
  ];
  
  log('Required for cloud testing (can be set later):', 'yellow');
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      log(`✓ ${envVar} is set`, 'green');
    } else {
      log(`○ ${envVar} not set (required for cloud testing)`, 'yellow');
    }
  });
  
  log('\nOptional configuration:', 'blue');
  optionalEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      log(`✓ ${envVar} is set`, 'green');
    } else {
      log(`○ ${envVar} not set (will use defaults)`, 'blue');
    }
  });
}

function generateSetupReport() {
  log('\n' + colors.bold + '='.repeat(60) + colors.reset);
  log(colors.bold + 'CROSS-BROWSER TESTING SETUP VALIDATION' + colors.reset);
  log(colors.bold + '='.repeat(60) + colors.reset);
  
  const results = {
    packageJson: validatePackageJson(),
    configFiles: validateConfigFiles(),
    testFiles: validateTestFiles(),
    documentation: validateDocumentation()
  };
  
  validateEnvironmentVariables();
  
  log('\n' + colors.bold + 'VALIDATION SUMMARY:' + colors.reset);
  log('─'.repeat(40));
  
  Object.entries(results).forEach(([category, passed]) => {
    const status = passed ? '✓ PASS' : '✗ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${status} ${category.replace(/([A-Z])/g, ' $1').toLowerCase()}`, color);
  });
  
  const allPassed = Object.values(results).every(Boolean);
  
  log('\n' + colors.bold + 'OVERALL STATUS:' + colors.reset);
  if (allPassed) {
    log('🎉 Cross-browser testing setup is COMPLETE!', 'green');
    log('\nNext steps:', 'blue');
    log('1. Set up environment variables for cloud testing (optional)');
    log('2. Run: npm run test:cross-browser');
    log('3. Check reports in cross-browser-reports/ directory');
  } else {
    log('⚠️  Cross-browser testing setup needs attention', 'yellow');
    log('\nPlease address the missing components above.');
  }
  
  log('\n' + colors.bold + 'Available Commands:' + colors.reset);
  log('npm run test:cross-browser    # Run all cross-browser tests');
  log('npm run test:chrome          # Test on Chrome only');
  log('npm run test:firefox         # Test on Firefox only');
  log('npm run test:safari          # Test on Safari only');
  log('npm run test:edge            # Test on Edge only');
  log('npm run test:browserstack    # Run on BrowserStack');
  log('npm run test:saucelabs       # Run on Sauce Labs');
  
  return allPassed;
}

// Run the validation
if (require.main === module) {
  try {
    const success = generateSetupReport();
    process.exit(success ? 0 : 1);
  } catch (error) {
    log(`\nValidation failed with error: ${error.message}`, 'red');
    process.exit(1);
  }
}

module.exports = { generateSetupReport };