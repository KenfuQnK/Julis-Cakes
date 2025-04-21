const fs = require('fs');
const path = require('path');
const { marked } = require('marked'); // Importar correctamente marked

// Rutas de las carpetas
const recipesDir = path.join(__dirname, 'recipes');
const renderedDir = path.join(__dirname, 'rendered');
const templatePath = path.join(renderedDir, 'template.html');

// Crear un renderer personalizado para "marked"
const renderer = new marked.Renderer();

// Personalizar las listas (ul y ol) para que se conviertan en contenedores de cards
renderer.list = function (body, ordered) {
  return `<div class="cards-container">${body}</div>`;
};

// Personalizar los elementos de lista (li) para que sean "cards"
renderer.listitem = function (text) {
    console.log('List item content:', text); // Depuración
    const content = typeof text === 'object' ? JSON.stringify(text) : marked.parseInline(text); 
    return `<div class="card">${content}</div>`;
};

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

  // Convertir el contenido a HTML usando el renderer personalizado
  const htmlContent = marked(markdownContent, { renderer });

  // Generar un slug para el nombre del archivo
  const originalTitle = path.basename(file, '.md');
  const slug = originalTitle
    .normalize('NFD') // Eliminar acentos
    .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
    .replace(/\s+/g, '_') // Reemplazar espacios por guiones bajos
    .replace(/[^\w\-]/g, '') // Eliminar caracteres no alfanuméricos
    .toLowerCase();

  // Escapar caracteres especiales en el título
  const escapedTitle = originalTitle
    .replace(/&/g, '&amp;') // Escapar ampersand
    .replace(/</g, '&lt;') // Escapar menor que
    .replace(/>/g, '&gt;') // Escapar mayor que
    .replace(/"/g, '&quot;') // Escapar comillas dobles
    .replace(/'/g, '&#39;'); // Escapar comillas simples

  // Reemplazar los marcadores en la plantilla
  const finalHtml = template
    .replace('{{title}}', escapedTitle)
    .replace('{{content}}', htmlContent);

  // Guardar el archivo HTML en la carpeta `rendered`
  const outputFilePath = path.join(renderedDir, `${slug}.html`);
  fs.writeFileSync(outputFilePath, finalHtml, 'utf8');

  console.log(`Generated: ${outputFilePath}`);
});
