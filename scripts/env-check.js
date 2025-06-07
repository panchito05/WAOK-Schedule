const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const envExamplePath = path.join(rootDir, '.env.example');
const envPath = path.join(rootDir, '.env');

const red = '\x1b[31m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const reset = '\x1b[0m';

function main() {
    if (!fs.existsSync(envExamplePath)) {
        console.log(`${yellow}ADVERTENCIA: No se encontró el archivo .env.example. No se pueden verificar las variables de entorno.${reset}`);
        return;
    }

    const exampleContent = fs.readFileSync(envExamplePath, 'utf8');
    const requiredVars = exampleContent
        .split('\n')
        .map(line => line.split('=')[0])
        .filter(key => key.trim() !== '' && !key.trim().startsWith('#'));

    if (!fs.existsSync(envPath)) {
        console.error(`${red}ERROR: Falta el archivo .env.${reset}`);
        console.log(`Por favor, copie .env.example a .env y configure las variables requeridas:`);
        console.log(requiredVars.join(', '));
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const definedVars = new Set(envContent.split('\n').map(line => line.split('=')[0]));

    const missingVars = requiredVars.filter(v => !definedVars.has(v));

    if (missingVars.length > 0) {
        console.error(`${red}ERROR: Faltan las siguientes variables de entorno en tu archivo .env:${reset}`);
        missingVars.forEach(v => console.log(`  - ${v}`));
        console.log('\nAsegúrese de que su archivo .env esté completo.');
        process.exit(1);
    }

    console.log(`${green}✓ Verificación de entorno completada. Todas las variables requeridas están presentes.${