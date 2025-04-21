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
  const type = ordered ? "ol" : "ul";
  return `<div class="cards-container" data-list-type="${type}">${body}</div>`;
};

// Manejo personalizado para elementos de lista con checkboxes
renderer.listitem = function (text) {
  // Verificar si es un elemento de lista de verificación
  if (text.includes('type="checkbox"')) {
    // Extraer el texto después del checkbox
    const labelText = text.replace(/<input[^>]*>/, '').trim();
    return `<div class="card">${labelText}</div>`;
  }
  
  // Para elementos de lista normales
  return `<div class="card">${text}</div>`;
};

// Agregar soporte para tareas/checkboxes
renderer.checkbox = function(checked) {
  return '';  // No mostrar el checkbox, solo el texto
};

// Configuramos las opciones de marked
const markedOptions = {
  renderer: renderer,
  gfm: true,           // GitHub Flavored Markdown
  breaks: true,        // Convertir saltos de línea en <br>
  headerIds: true,     // Añadir IDs a los encabezados
  mangle: false,       // No codificar caracteres @ en email links
  smartLists: true,    // Usar reglas tipográficas para listas
  smartypants: false,  // No usar reglas tipográficas para puntuación
  xhtml: false,        // No cerrar etiquetas vacías como en XHTML
  highlight: null,     // No resaltar sintaxis de código
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
  const htmlContent = marked(markdownContent, markedOptions);

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

  // Reemplazar TODAS las ocurrencias de {{title}} en la plantilla
  let finalHtml = template.replace(/\{\{title\}\}/g, escapedTitle);
  
  // Reemplazar {{content}} con el contenido HTML generado
  finalHtml = finalHtml.replace('{{content}}', htmlContent);

  // Guardar el archivo HTML en la carpeta `rendered`
  const outputFilePath = path.join(renderedDir, `${slug}.html`);
  fs.writeFileSync(outputFilePath, finalHtml, 'utf8');

  console.log(`Generated: ${outputFilePath}`);
});
