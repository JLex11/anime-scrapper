import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'

export default defineConfig({
	srcDir: './src',
	publicDir: './public',
	output: 'static',
	base: '/api-docs',
	integrations: [mdx()],
	markdown: {
		syntaxHighlight: 'shiki',
		shikiConfig: {
			theme: 'github-dark-dimmed',
		},
	},
})
