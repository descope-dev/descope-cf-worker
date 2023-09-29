import type { Config } from "jest";

const config: Config = {
	preset: "ts-jest",
	testEnvironment: "miniflare",
	verbose: true,
	collectCoverageFrom: ["src/**/worker.ts"],
	coverageThreshold: {
		global: {
			lines: 100,
		},
	},
};

export default config;
