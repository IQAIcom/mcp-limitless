import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		include: ["**/*.test.ts"],
		exclude: ["node_modules", "dist"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/**",
				"dist/**",
				"tests/**",
				"**/*.test.ts",
				"**/*.config.ts",
			],
			include: ["src/**/*.ts"],
		},
		// Separate test suites for better organization
		sequence: {
			shuffle: false,
		},
		// Default timeout for tests
		testTimeout: 5000,
		// Hook timeout
		hookTimeout: 10000,
	},
});
