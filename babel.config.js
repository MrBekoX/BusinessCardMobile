module.exports = function(api) {
  api.cache(true);
  const isTest = process.env.NODE_ENV === 'test' || process.env.BABEL_ENV === 'test';

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ...(!isTest
        ? [[
            'module:react-native-dotenv',
            {
              envName: 'APP_ENV',
              moduleName: '@env',
              path: '.env',
              blacklist: null,
              whitelist: ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'APP_ENV'],
              safe: true,
              allowUndefined: false,
            },
          ]]
        : []),
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@utils': './src/utils',
            '@lib': './src/lib',
            '@types': './src/types',
            '@context': './src/context',
            '@config': './src/config',
            '@navigation': './src/navigation',
            '@constants': './src/constants',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
