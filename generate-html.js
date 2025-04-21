const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Rutas
const recipesDir = path.join(__dirname, 'recipes');
const renderedDir = path.join(__dirname, 'rendered');
const templatePath = path.join(renderedDir, 'template.html');

console.log('🔍 Script iniciado');

// Personalizar el renderer para dar formato de cards
const renderer = new marked.Renderer();

// Personalizar listas (ul/ol) para que sean contenedores de cards
renderer.list = function(body, ordered) {
  const type = ordered ? 'ol' : 'ul';
  return `<div class="cards-container ${ordered ? 'steps-cards' : 'ingredients-cards'}">${body}</div>`;
};

// Personalizar elementos de lista (li) para que sean cards
renderer.listitem = function(text) {
  // Extraer texto limpio si contiene checkbox
  if (text.includes('type="checkbox"')) {
    text = text.replace(/<input[^>]*>/g, '').trim();
  }
  return `<div class="card">${text}</div>`;
};

// Opciones de marked para procesar el Markdown
const markedOptions = {
  renderer: renderer,
  gfm: true, // GitHub Flavored Markdown
  breaks: true,
  smartLists: true
};

// Obtener la plantilla HTML
const template = fs.readFileSync(templatePath, 'utf8');

// Leer archivos Markdown
const files = fs.readdirSync(recipesDir).filter(file => file.endsWith('.md'));

files.forEach(file => {
  console.log(`\n🔄 Procesando: ${file}`);
  
  // Leer contenido Markdown
  const filePath = path.join(recipesDir, file);
  const markdownContent = fs.readFileSync(filePath, 'utf8');
  
  // Convertir a HTML usando el renderer personalizado
  const htmlContent = marked(markdownContent, markedOptions);
  
  // Título y slug
  const originalTitle = path.basename(file, '.md');
  const slug = originalTitle
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^\w\-]/g, '')
    .toLowerCase();
  
  // Crear HTML final - reemplazar todas las ocurrencias
  const finalHtml = template
    .replace(/\{\{title\}\}/g, originalTitle)
    .replace('{{content}}', htmlContent);
  
  // Guardar el archivo HTML
  const outputFilePath = path.join(renderedDir, `${slug}.html`);
  fs.writeFileSync(outputFilePath, finalHtml, 'utf8');
  
  console.log(`✅ Generado: ${outputFilePath}`);
});

console.log('\n✨ Procesamiento completado');
