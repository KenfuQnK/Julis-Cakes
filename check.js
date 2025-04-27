// check-tailwind-setup.js
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

function checkPackageInstalled(pkg) {
  try {
    require.resolve(pkg);
    return true;
  } catch (e) {
    return false;
  }
}

function checkFileContains(filePath, text) {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes(text);
}

function checkExpoVersion() {
  try {
    const output = child_process.execSync('expo --version').toString().trim();
    const major = parseInt(output.split('.')[0], 10);
    return major >= 48;
  } catch (e) {
    return false;
  }
}

console.log('--- Comprobación de entorno Tailwind+NativeWind ---');

console.log(checkPackageInstalled('nativewind') ? '✅ nativewind instalado' : '❌ nativewind NO instalado');
console.log(checkPackageInstalled('tailwindcss') ? '✅ tailwindcss instalado' : '❌ tailwindcss NO instalado');

console.log(fs.existsSync('tailwind.config.js') ? '✅ tailwind.config.js encontrado' : '❌ tailwind.config.js NO encontrado');
console.log(checkFileContains('babel.config.js', 'nativewind/babel') ? '✅ babel.config.js contiene nativewind/babel' : '❌ babel.config.js NO configurado correctamente');

console.log(checkExpoVersion() ? '✅ Expo SDK >=48' : '❌ Expo SDK antiguo o no encontrado');

console.log('\nSi ves algún ❌, corrígelo antes de seguir.');
