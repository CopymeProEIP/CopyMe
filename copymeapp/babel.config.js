module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './',
        },
      },
    ],
    ['dotenv-import', {
      moduleName: '@env',
      path: '.env',
    }],
    'react-native-reanimated/plugin',
  ],
};
