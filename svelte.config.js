import adapter from "@sveltejs/adapter-static";
// import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

const dev = process.env.NODE_ENV === 'development';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter({
				pages: "docs",
				assets: "docs",
				fallback: "index.html"
		}),
		prerender: {
			default: true
		},
		paths: {
				// change below to your repo name
				base: dev ? "" : "/svelte-sheets",
		},
}
};

export default config;
