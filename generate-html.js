const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Rutas
const recipesDir = path.join(__dirname, 'recipes');
const renderedDir = path.join(__dirname, 'rendered');
const templatePath = path.join(renderedDir, 'template.html');

console.log('🔍 Script iniciado');

// Obtener la plantilla HTML
const template = fs.readFileSync(templatePath, 'utf8');

// Leer archivos Markdown
const files = fs.readdirSync(recipesDir).filter(file => file.endsWith('.md'));

// Obtener lista de todas las recetas para el sidebar
const recipesList = files.map(file => {
  const title = path.basename(file, '.md');
  const slug = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^\w\-]/g, '')
    .toLowerCase();
  
  return { title, slug };
});

// Crear HTML para sidebar de recetas
const createSidebarHTML = (currentSlug) => {
  let sidebarHTML = '<h2 class="recipes-list-title">Listado de recetas</h2>';
  
  recipesList.forEach(recipe => {
    sidebarHTML += `
      <div class="recipe-card">
        <div class="recipe-card-title">${recipe.title}</div>
        <a href="${recipe.slug}.html"><div class="recipe-card-image">imagen</div></a>
      </div>
    `;
  });
  
  return sidebarHTML;
};

files.forEach(file => {
  console.log(`\n🔄 Procesando: ${file}`);
  
  // Leer contenido Markdown
  const filePath = path.join(recipesDir, file);
  let markdownContent = fs.readFileSync(filePath, 'utf8');
  
  // Eliminar los checkboxes del Markdown antes de procesarlo
  markdownContent = markdownContent.replace(/- \[ \]/g, '-');
  
  // Convertir a HTML usando marked
  let htmlContent = marked.parse(markdownContent);
  
  // Modificar el HTML para formato de cards
  // Transformar títulos
  htmlContent = htmlContent.replace(/<h1>(.*?)<\/h1>/g, '<h1 class="section-title">$1</h1>');
  
  // Convertir listas en cards para ingredientes y eliminar cualquier checkbox restante
  htmlContent = htmlContent.replace(/<ul>/g, '<div class="cards-container ingredients-cards">');
  htmlContent = htmlContent.replace(/<\/ul>/g, '</div>');
  htmlContent = htmlContent.replace(/<li>(.*?)<\/li>/g, function(match, p1) {
    // Eliminar cualquier checkbox que pudiera quedar en el HTML
    let textContent = p1.replace(/<input[^>]*>/g, '').trim();
    return `
      <div class="card">
        <div class="card-image">imagen</div>
        <div class="card-text"><div class="card-text-content">${textContent}</div></div>
      </div>
    `;
  });
  
  // Convertir listas numeradas en cards para pasos
  let stepCounter = 0;
  htmlContent = htmlContent.replace(/<ol>/g, '<div class="cards-container steps-cards">');
  htmlContent = htmlContent.replace(/<\/ol>/g, '</div>');
  htmlContent = htmlContent.replace(/<li>(.*?)<\/li>/g, function(match, p1) {
    stepCounter++;
    return `
      <div class="card">
        <div class="card-number">Paso ${stepCounter}</div>
        <div class="card-image">imagen</div>
        <div class="card-text"><div class="card-text-content">${p1}</div></div>
      </div>
    `;
  });
  
  // Restablecer contador para el próximo archivo
  stepCounter = 0;
  
  // Título y slug
  const originalTitle = path.basename(file, '.md');
  const slug = originalTitle
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^\w\-]/g, '')
    .toLowerCase();
  
  // Generar HTML para el sidebar
  const sidebarHTML = createSidebarHTML(slug);
  
  // Crear HTML final - con reemplazos más precisos
  let finalHtml = template
    .replace(/\{\{title\}\}/g, originalTitle)
    .replace('{{content}}', htmlContent);
  
  // Reemplazar el sidebar placeholder
  finalHtml = finalHtml.replace('<div class="recipes-list-column">\n        <h2 class="recipes-list-title">Listado de recetas</h2>\n        <div class="recipe-card">\n            <div class="recipe-card-title">Receta 1</div>\n            <div class="recipe-card-image">imagen</div>\n        </div>\n        <div class="recipe-card">\n            <div class="recipe-card-title">Receta 2</div>\n            <div class="recipe-card-image">imagen</div>\n        </div>\n        <div class="recipe-card">\n            <div class="recipe-card-title">Receta 3</div>\n            <div class="recipe-card-image">imagen</div>\n        </div>\n    </div>', `<div class="recipes-list-column">\n        ${sidebarHTML}\n    </div>`);
  
  // Guardar el archivo HTML
  const outputFilePath = path.join(renderedDir, `${slug}.html`);
  fs.writeFileSync(outputFilePath, finalHtml, 'utf8');
  
  console.log(`✅ Generado: ${outputFilePath}`);
});

// Crear página de índice
console.log('\n📑 Creando página de índice...');

const indexHTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Julis Cakes</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="home-container">
        <header>
            <h1 class="home-title">🎂 Julis Cakes</h1>
        </header>
        <main>
            <h2>Recetas Disponibles</h2>
            <ul class="home-recipe-list">
                ${recipesList.map(recipe => 
                  `<li class="home-recipe-item">
                    <a class="home-recipe-link" href="rendered/${recipe.slug}.html">${recipe.title}</a>
                  </li>`
                ).join('')}
            </ul>
        </main>
        <footer>
            <p>© 2025 Julis Cakes</p>
        </footer>
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'index.html'), indexHTML, 'utf8');
console.log('✅ Página de índice creada');

console.log('\n✨ Procesamiento completado');