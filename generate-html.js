const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Ruta de las carpetas
const recipesDir = path.join(__dirname, 'recipes');
const renderedDir = path.join(__dirname, 'rendered');
const templatePath = path.join(renderedDir, 'template.html');

// Leer la plantilla HTML
const template = fs.readFileSync(templatePath, 'utf8');

// Crear la carpeta `rendered` si no existe
if (!fs.existsSync(renderedDir)) {
  fs.mkdirSync(renderedDir);
}

// Leer archivos Markdown en la carpeta `recipes`
const files = fs.readdirSync(recipesDir).filter(file => file.endsWith('.md'));

files.forEach(file => {
  // Leer el contenido del archivo Markdown
  const filePath = path.join(recipesDir, file);
  const markdownContent = fs.readFileSync(filePath, 'utf8');

  // Convertir el contenido a HTML
  const htmlContent = marked(markdownContent);

  // Generar un slug para el nombre del archivo
  const title = path.basename(file, '.md');
  const slug = title
    .normalize('NFD') // Eliminar acentos
    .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
    .replace(/\s+/g, '_') // Reemplazar espacios por guiones bajos
    .replace(/[^\w\-]/g, '') // Eliminar caracteres no alfanuméricos
    .toLowerCase();

  // Reemplazar los marcadores en la plantilla
  const finalHtml = template
    .replace('{{title}}', title)
    .replace('{{content}}', htmlContent);

  // Guardar el archivo HTML en la carpeta `rendered`
  const outputFilePath = path.join(renderedDir, `${slug}.html`);
  fs.writeFileSync(outputFilePath, finalHtml, 'utf8');

  console.log(`Generated: ${outputFilePath}`);
});
