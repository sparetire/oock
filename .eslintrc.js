module.exports = {
	env: {
		'browser': true,
		'es6': true,
		'node': true,
		'commonjs': true,
		'amd': true,
		'jquery': true
	},
	parser: 'babel-eslint',
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true
		}
	},
	extends: 'eslint:recommended',
	rules: {
		'indent': ['warn', 'tab'],
		'linebreak-style': ['error', 'unix'],
		'quotes': ['warn', 'single'],
		'semi': ['error', 'always'],
		'init-declarations': ['warn', 'always'],
		'no-unused-vars': ['warn', {
			vars: 'local',
			args: 'none'
		}],
		'camelcase': ['error', {
			properties: 'always'
		}],
		'brace-style': ['warn', '1tbs', {
			'allowSingleLine': true
		}],
		'comma-style': ['warn', 'last'],
		'require-yield': 'off',
		'comma-spacing': 'warn',
		'radix': 'warn',
		'no-console': 'off',
		'no-debugger': 'off',
		'no-extra-boolean-cast': 'off'
	},
	globals: {
		console: false
	}
};