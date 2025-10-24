import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

export default [
    ...compat.extends('airbnb'),
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
            'react/prop-types': 0,
        },
    },
];