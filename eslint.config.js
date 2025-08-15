// eslint.config.js
import antfu from '@antfu/eslint-config'
import yml from 'eslint-plugin-yml'
import yamlParser from 'yaml-eslint-parser'

export default antfu({
    typescript: true,
    stylistic: {
        indent: 4, // 4, or 'tab'
        quotes: 'single', // or 'double'
    },
    ignores: [
        '**/types',
        '**/*.svg',
    ],
    rules: {
        'no-console': 'off',
        'node/prefer-global/process': 'off',
        'ts/explicit-function-return-type': 'off',
        'vue/block-order': 'off',
        'vue/valid-template-root': 'off',
    },
}, {
    files: ['**/*.yml', '**/*.yaml'],
    languageOptions: {
        parser: yamlParser,
    },
    plugins: {
        yml,
    },
    rules: {
        'yml/indent': ['error', 2],
    },
}, {
    files: ['**/*.md/*.yml', '**/*.md/*.yaml'], // markdown 中提取的 yml 代码块
    languageOptions: {
        parser: yamlParser,
    },
    plugins: {
        yml,
    },
    rules: {
        'yml/indent': ['error', 2],
    },
})
