module.exports = {
	parser: "@typescript-eslint/parser",
	extends: [
		"plugin:security/recommended",
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:prettier/recommended",
	],
	plugins: ["@typescript-eslint", "prettier"],
	overrides: [
		{
			files: [".eslintrc.{js,cjs}"],
			env: {
				node: true,
			},
			parserOptions: {
				sourceType: "script",
			},
		},
	],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	env: {
		node: true,
	},
};
