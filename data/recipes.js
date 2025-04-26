// Datos convertidos de los archivos Markdown a formato JSON
export const recipes = [
    {
      id: 'pastel_fitness_de_platano_y_chocolate',
      title: 'Pastel Fitness de Plátano y Chocolate',
      ingredients: [
        { name: '2 plátanos', image: require('../assets/images/placeholder.jpg') },
        { name: '1 huevo', image: require('../assets/images/placeholder.jpg') },
        { name: '2 cucharadas de leche de avellana o soja', image: require('../assets/images/placeholder.jpg') },
        { name: '2 cucharadas de cacao en polvo para hornear', image: require('../assets/images/placeholder.jpg') },
        { name: '4 cucharadas de harina de avena', image: require('../assets/images/placeholder.jpg') },
        { name: '3 cucharadas de harina de almendra', image: require('../assets/images/placeholder.jpg') },
        { name: '1 cucharadita de aroma de vainilla', image: require('../assets/images/placeholder.jpg') },
        { name: '4 cucharadas de azúcar moreno', image: require('../assets/images/placeholder.jpg') },
        { name: 'Chips de chocolate al gusto', image: require('../assets/images/placeholder.jpg') }
      ],
      steps: [
        { description: 'Precalienta el horno a 180 °C con calor arriba y abajo', image: require('../assets/images/placeholder.jpg') },
        { description: 'Tritura los plátanos con un tenedor hasta obtener una textura cremosa', image: require('../assets/images/placeholder.jpg') },
        { description: 'Añade el huevo y la leche vegetal, y mezcla bien', image: require('../assets/images/placeholder.jpg') },
        { description: 'Incorpora el cacao, la harina de avena, la harina de almendra y el aroma de vainilla', image: require('../assets/images/placeholder.jpg') },
        { description: 'Agrega el azúcar moreno y mezcla hasta obtener una masa homogénea', image: require('../assets/images/placeholder.jpg') },
        { description: 'Añade los chips de chocolate si lo deseas', image: require('../assets/images/placeholder.jpg') },
        { description: 'Vierte la masa en un molde pequeño previamente engrasado o en moldes para muffins', image: require('../assets/images/placeholder.jpg') },
        { description: 'Hornea durante unos 15 minutos', image: require('../assets/images/placeholder.jpg') },
        { description: 'Deja enfriar y ¡disfruta!', image: require('../assets/images/placeholder.jpg') }
      ],
      tips: []
    },
    {
      id: 'pastel_de_chocolate',
      title: 'Pastel de Chocolate',
      ingredients: [
        { name: '1 tableta de chocolate', image: require('../assets/images/placeholder.jpg') },
        { name: '175 g de mantequilla', image: require('../assets/images/placeholder.jpg') },
        { name: '1 vaso de leche', image: require('../assets/images/placeholder.jpg') },
        { name: '100 g de azúcar moreno', image: require('../assets/images/placeholder.jpg') },
        { name: '3 huevos (claras y yemas separadas)', image: require('../assets/images/placeholder.jpg') },
        { name: '1 bolsa de galletas redondas', image: require('../assets/images/placeholder.jpg') }
      ],
      steps: [
        { description: 'Derretir el chocolate con la mantequilla a fuego lento', image: require('../assets/images/placeholder.jpg') },
        { description: 'Añadir la leche y mezclar bien', image: require('../assets/images/placeholder.jpg') },
        { description: 'Incorporar el azúcar moreno y remover hasta disolver', image: require('../assets/images/placeholder.jpg') },
        { description: 'Agregar las yemas al chocolate derretido y mezclar', image: require('../assets/images/placeholder.jpg') },
        { description: 'Batir las claras a punto de nieve', image: require('../assets/images/placeholder.jpg') },
        { description: 'Incorporar las claras con movimientos envolventes', image: require('../assets/images/placeholder.jpg') },
        { description: 'Forrar un molde con papel y poner una capa de galletas', image: require('../assets/images/placeholder.jpg') },
        { description: 'Verter parte de la mezcla sobre las galletas', image: require('../assets/images/placeholder.jpg') },
        { description: 'Repetir capas hasta terminar con mezcla arriba', image: require('../assets/images/placeholder.jpg') },
        { description: 'Refrigerar al menos 4 horas antes de servir', image: require('../assets/images/placeholder.jpg') }
      ],
      tips: [
        { tip: 'Usa chocolate negro para un sabor más intenso', image: require('../assets/images/placeholder.jpg') },
        { tip: 'Asegúrate de que el chocolate no esté caliente al añadir las yemas', image: require('../assets/images/placeholder.jpg') }
      ]
    },
    {
      id: 'pastel_de_queso_en_air_fryer',
      title: 'Pastel de Queso en Air Fryer',
      ingredients: [
        { name: '300 g de queso crema', image: require('../assets/images/placeholder.jpg') },
        { name: '90 g de azúcar', image: require('../assets/images/placeholder.jpg') },
        { name: '2 huevos', image: require('../assets/images/placeholder.jpg') },
        { name: '150 ml de nata (crema para batir)', image: require('../assets/images/placeholder.jpg') },
        { name: '1 cucharada de harina', image: require('../assets/images/placeholder.jpg') },
        { name: '1 pizca de sal', image: require('../assets/images/placeholder.jpg') }
      ],
      steps: [
        { description: 'Mezcla el queso crema con el azúcar', image: require('../assets/images/placeholder.jpg') },
        { description: 'Añade los huevos y bate bien', image: require('../assets/images/placeholder.jpg') },
        { description: 'Incorpora la nata y mezcla', image: require('../assets/images/placeholder.jpg') },
        { description: 'Agrega la harina y la sal, mezcla hasta integrar', image: require('../assets/images/placeholder.jpg') },
        { description: 'Vierte la mezcla en un molde apto para Air Fryer', image: require('../assets/images/placeholder.jpg') },
        { description: 'Cocina a 160 °C durante 45 minutos', image: require('../assets/images/placeholder.jpg') },
        { description: 'Cubre con papel aluminio los últimos 10 minutos', image: require('../assets/images/placeholder.jpg') }
      ],
      tips: [
        { tip: 'Usa un molde de silicona o que quepa justo en la Air Fryer', image: require('../assets/images/placeholder.jpg') },
        { tip: 'Deja enfriar antes de desmoldar para mejor consistencia', image: require('../assets/images/placeholder.jpg') }
      ]
    },
    {
      id: 'receta_-_brazo_de_gitano',
      title: 'Brazo de Gitano',
      ingredients: [
        { name: '4 claras de huevo', image: require('../assets/recipes/recipe-0001/ingredient_001.jpg') },
        { name: '4 yemas de huevo', image: require('../assets/images/placeholder.jpg') },
        { name: '3 cucharadas de agua tibia', image: require('../assets/images/placeholder.jpg') },
        { name: '125 g de azúcar', image: require('../assets/images/placeholder.jpg') },
        { name: '1 sobre de azúcar avainillada (aprox. 8 g)', image: require('../assets/images/placeholder.jpg') },
        { name: '75 g de harina de trigo', image: require('../assets/images/placeholder.jpg') },
        { name: '50 g de harina de maíz (maicena)', image: require('../assets/images/placeholder.jpg') },
        { name: '½ sobre de levadura química (polvo de hornear, aprox. 7 g)', image: require('../assets/images/placeholder.jpg') },
        { name: 'Crema de avellana (al gusto)', image: require('../assets/images/placeholder.jpg') },
        { name: 'Azúcar glas para espolvorear', image: require('../assets/images/placeholder.jpg') }
      ],
      steps: [
        { description: 'Precalienta el horno a 180 °C con calor arriba y abajo', image: require('../assets/recipes/recipe-0001/step_001.png') },
        { description: 'Separa las claras y las yemas', image: require('../assets/recipes/recipe-0001/step_002.png') },
        { description: 'Bate las claras a punto de nieve y resérvalas', image: require('../assets/recipes/recipe-0001/step_003.png') },
        { description: 'Bate las yemas con el agua tibia hasta que espumen', image: require('../assets/images/placeholder.jpg') },
        { description: 'Añade el azúcar y el azúcar avainillado poco a poco, batiendo hasta que la mezcla doble su volumen', image: require('../assets/images/placeholder.jpg') },
        { description: 'Mezcla y tamiza la harina de trigo, la harina de maíz y la levadura', image: require('../assets/images/placeholder.jpg') },
        { description: 'Incorpora esta mezcla seca a las yemas batidas con movimientos suaves', image: require('../assets/images/placeholder.jpg') },
        { description: 'Agrega las claras montadas poco a poco con movimientos envolventes', image: require('../assets/images/placeholder.jpg') },
        { description: 'Vierte la masa sobre una bandeja de horno forrada con papel vegetal y repártela de forma uniforme', image: require('../assets/images/placeholder.jpg') },
        { description: 'Hornea durante 10 minutos, hasta que el bizcocho esté ligeramente dorado', image: require('../assets/images/placeholder.jpg') },
        { description: 'Prepara un paño limpio o una hoja de papel vegetal y espolvorea con azúcar glas', image: require('../assets/images/placeholder.jpg') },
        { description: 'Saca el bizcocho del horno y vuélcalo sobre el paño/papel con azúcar glas', image: require('../assets/images/placeholder.jpg') },
        { description: 'Retira el papel de hornear con cuidado', image: require('../assets/images/placeholder.jpg') },
        { description: 'Unta la crema de avellana por toda la superficie del bizcocho', image: require('../assets/images/placeholder.jpg') },
        { description: 'Enrolla el bizcocho desde uno de los lados largos, con ayuda del paño/papel', image: require('../assets/recipes/recipe-0001/step_015.png') },
        { description: 'Deja enfriar completamente el brazo de gitano', image: require('../assets/images/placeholder.jpg') }
      ],
      tips: [
        { tip: 'Los pasos 12 a 15 deben hacerse sin demora, mientras el bizcocho aún está tibio y flexible.', image: require('../assets/images/placeholder.jpg') },
        { tip: 'Si se enfría demasiado, se puede romper al enrollar', image: require('../assets/images/placeholder.jpg') }
      ]
    },
    {
      id: 'receta_-_pastel_de_zanahoria',
      title: 'Pastel de Zanahoria',
      ingredients: [
        { name: '150 g de zanahoria rallada', image: require('../assets/images/placeholder.jpg') },
        { name: '3 yemas de huevo', image: require('../assets/images/placeholder.jpg') },
        { name: '3 claras de huevo', image: require('../assets/images/placeholder.jpg') },
        { name: '90 g de azúcar moreno', image: require('../assets/images/placeholder.jpg') },
        { name: '45 g de harina de trigo', image: require('../assets/images/placeholder.jpg') },
        { name: '1 cucharadita de levadura química (polvo de hornear)', image: require('../assets/images/placeholder.jpg') },
        { name: '100 g de almendra molida', image: require('../assets/images/placeholder.jpg') },
        { name: '60 g de avellana molida', image: require('../assets/images/placeholder.jpg') },
        { name: '30 g de pistacho molido', image: require('../assets/images/placeholder.jpg') },
        { name: 'Chocolate troceado (al gusto)', image: require('../assets/images/placeholder.jpg') }
      ],
      steps: [
        { description: 'Precalienta el horno a 180 °C con calor arriba y abajo', image: require('../assets/images/placeholder.jpg') },
        { description: 'Bate las yemas con el azúcar moreno hasta que la mezcla doble su volumen', image: require('../assets/images/placeholder.jpg') },
        { description: 'Añade la harina, canela y la levadura tamizadas, y mezcla bien', image: require('../assets/images/placeholder.jpg') },
        { description: 'Bate las claras a punto de nieve firme', image: require('../assets/images/placeholder.jpg') },
        { description: 'Incorpora la mitad de las claras a la mezcla yemas-harina, mezcla con suavidad', image: require('../assets/images/placeholder.jpg') },
        { description: 'Añade la segunda mitad de las claras con movimientos envolventes', image: require('../assets/images/placeholder.jpg') },
        { description: 'Agrega la almendra molida, la avellana molida y el pistacho molido', image: require('../assets/images/placeholder.jpg') },
        { description: 'Incorpora la zanahoria rallada, mezclando con cuidado', image: require('../assets/images/placeholder.jpg') },
        { description: 'Forrar un molde de 18 cm de diámetro con papel vegetal', image: require('../assets/images/placeholder.jpg') },
        { description: 'FALTAN PASOS', image: require('../assets/images/placeholder.jpg') }
      ]
    }
]