import { Dimensions } from 'react-native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export default {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  padding: {
    small: 8,
    medium: 16,
    large: 24,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
  },
  fontSize: {
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
    xxlarge: 32,
  },
  cardAspectRatio: 1.2, // Aspecto para las tarjetas, adaptado del original
  cardSizes: {
    ingredient: {
      //width: (width / 2) - 24, // 2 columnas con padding
      //height: ((width / 2) - 24) * 1.2
      width: (width / 12) - 24, // Más columnas (3 en lugar de 2)
      height: ((width / 12) - 24) * 1.2 // Relación de aspecto más compacta (0.8 en lugar de 1.2)
    },
    step: {
      //width: (width / 2) - 24,
      //height: ((width / 2) - 24) * 1.2
      width: (width / 12) - 24,
        height: ((width / 12) - 24) * 1.4
    },
    recipe: {
      height: 70
    }
  },
  // Adaptación para diferentes tamaños de pantalla
  responsive: {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
  }
};