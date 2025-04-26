import * as Linking from 'expo-linking';

const linking = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      Home: '',
      Recipe: 'recipe/:id',
      NotFound: '*',
    },
  },
};

export default linking;