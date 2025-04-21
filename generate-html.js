const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const cheerio = require('cheerio'); // Añadir esta dependencia

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
    const isActive = recipe.slug === currentSlug ? 'recipe-card-active' : '';
    sidebarHTML += `
      <div class="recipe-card ${isActive}">
        <a href="${recipe.slug}.html">
          <div class="recipe-card-title">${recipe.title}</div>
          <div class="recipe-card-image">imagen</div>
        </a>
      </div>
    `;
  });
  
  return sidebarHTML;
};

files.forEach(file => {
  console.log(`\n🔄 Procesando: ${file}`);
  
  // Definir slug al inicio para usarlo en todo el procesamiento
  const originalTitle = path.basename(file, '.md');
  const slug = originalTitle
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^\w\-]/g, '')
    .toLowerCase();
  
  // Leer contenido Markdown
  const filePath = path.join(recipesDir, file);
  let markdownContent = fs.readFileSync(filePath, 'utf8');
  
  // Eliminar los checkboxes del Markdown antes de procesarlo
  markdownContent = markdownContent.replace(/- \[ \]/g, '-');
  
  // Convertir a HTML usando marked
  let htmlContent = marked.parse(markdownContent);
  
  // Cargar el HTML en cheerio para manipulación
  const $ = cheerio.load(htmlContent);
  
  // Transformar títulos
  $('h1').addClass('section-title');
  
  // Procesar ingredientes (ul -> cards)
  let ingredienteCounter = 0;
  $('ul').each(function() {
    const ul = $(this);
    const cardsContainer = $('<div class="cards-container ingredients-cards"></div>');
    
    ul.find('li').each(function() {
      ingredienteCounter++;
      const li = $(this);
      const textContent = li.text().trim();
      const imagePath = `./img/recipes/${slug}/ingredients/ingrediente_${ingredienteCounter}.png`;
      
      const card = $(`
        <div class="card">
          <div class="card-image"><img src="${imagePath}" onerror="if(this.src!='./img/recipes/placeholder.jpg')this.src='./img/recipes/placeholder.jpg';else this.onerror=null;" alt="${textContent}" />
          <div class="card-text"><div class="card-text-content">${textContent}</div></div>
        </div>
      `);
      
      cardsContainer.append(card);
    });
    
    ul.replaceWith(cardsContainer);
  });
  
  // Procesar pasos (ol -> cards)
  let stepCounter = 0;
  $('ol').each(function() {
    const ol = $(this);
    const cardsContainer = $('<div class="cards-container steps-cards"></div>');
    
    ol.find('li').each(function() {
      stepCounter++;
      const li = $(this);
      const textContent = li.html().trim(); // Usamos html() en lugar de text() para preservar formateo interior
      const imagePath = `./img/recipes/${slug}/directions/step_${stepCounter}.png`;
      
      const card = $(`
        <div class="card">
          <div class="card-number">Paso ${stepCounter}</div>
          <div class="card-image"><img src="${imagePath}" onerror=""if(this.src!='./img/recipes/placeholder.jpg')this.src='./img/recipes/placeholder.jpg';else this.onerror=null;" alt="${stepCounter}" />
          <div class="card-text"><div class="card-text-content">${textContent}</div></div>
        </div>
      `);
      
      cardsContainer.append(card);
    });
    
    ol.replaceWith(cardsContainer);
  });
  
  // Convertir de vuelta a HTML
  htmlContent = $.html();
  
  // Generar HTML para el sidebar con la receta actual resaltada
  const sidebarHTML = createSidebarHTML(slug);
  
  // Crear HTML final - con reemplazos más precisos
  let finalHtml = template
    .replace(/\{\{title\}\}/g, originalTitle)
    .replace('{{content}}', htmlContent);
  
  // Reemplazar el sidebar placeholder - buscamos la estructura del div y su contenido
  const sidebarRegex = /<div class="recipes-list-column">[\s\S]*?<\/div>/;
  finalHtml = finalHtml.replace(sidebarRegex, `<div class="recipes-list-column">\n        ${sidebarHTML}\n    </div>`);
  
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

// Asegurarnos de que el archivo CSS también esté actualizado
fs.writeFileSync(path.join(renderedDir, 'styles-recipes.css'), fs.readFileSync(path.join(__dirname, 'rendered', 'styles-recipes.css'), 'utf8'), 'utf8');
console.log('✅ Archivos CSS actualizados');

console.log('\n✨ Procesamiento completado');