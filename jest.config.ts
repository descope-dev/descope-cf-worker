import type { Config } from "jest";

const config: Config = {
	preset: "ts-jest",
	testEnvironment: "miniflare",
	verbose: true,

	collectCoverageFrom: ["src/**/worker.ts"],
};

export default config;
