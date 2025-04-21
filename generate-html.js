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

// ENFOQUE ALTERNATIVO: No personalizar renderer.list y renderer.listitem
// En su lugar, transformamos el HTML ya generado

// Obtener la plantilla HTML
const template = fs.readFileSync(templatePath, 'utf8');

// Leer archivos Markdown
const files = fs.readdirSync(recipesDir).filter(file => file.endsWith('.md'));

files.forEach(file => {
  console.log(`\n🔄 Procesando: ${file}`);
  
  // Leer contenido Markdown
  const filePath = path.join(recipesDir, file);
  const markdownContent = fs.readFileSync(filePath, 'utf8');
  
  // Convertir a HTML usando marked normal (sin renderer personalizado)
  let htmlContent = marked.parse(markdownContent);
  
  // Modificar el HTML generado para convertir listas en cards
  // 1. Reemplazar <ul> por divs con clase cards-container ingredients-cards
  htmlContent = htmlContent.replace(/<ul>/g, '<div class="cards-container ingredients-cards">');
  htmlContent = htmlContent.replace(/<\/ul>/g, '</div>');
  
  // 2. Reemplazar <ol> por divs con clase cards-container steps-cards
  htmlContent = htmlContent.replace(/<ol>/g, '<div class="cards-container steps-cards">');
  htmlContent = htmlContent.replace(/<\/ol>/g, '</div>');
  
  // 3. Reemplazar <li> por divs con clase card
  htmlContent = htmlContent.replace(/<li>(.*?)<\/li>/g, '<div class="card">$1</div>');
  
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
  
  // Imprimir un fragmento del HTML generado para debug
  console.log('📄 Fragmento del HTML generado:');
  console.log(htmlContent.substring(0, 500) + '...');
});

console.log('\n✨ Procesamiento completado');
