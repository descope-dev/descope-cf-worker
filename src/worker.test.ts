import { CookieOptions, deserialize, serialize } from "./cookieParser";
import { handleRequest } from "./worker";

const env = {
	DESCOPE_BASE_URL: "https://api.descope.com",
	DESCOPE_SESSION_COOKIE: "DS",
	DESCOPE_SESION_REFRESH_COOKIE: "DSR",
};
const DO_NOT_MODIFY = "DO_NOT_MODIFY";
const cookieNames = [
	env.DESCOPE_SESSION_COOKIE,
	env.DESCOPE_SESION_REFRESH_COOKIE,
	DO_NOT_MODIFY,
];
const value = "1234";
const options: CookieOptions = {
	domain: new URL(env.DESCOPE_BASE_URL).hostname,
	expires: "1234",
	path: "/",
	secure: true,
	httpOnly: true,
	sameSite: "Strict",
};
const responseBody = "OK";
const cors = { "Access-Control-Allow-Origin": new URL(env.DESCOPE_BASE_URL).hostname };

const fetchMock = getMiniflareFetchMock();

describe("worker", () => {
	beforeEach(() => {
		fetchMock.disableNetConnect();
	});

	it("should alter descope cookie domain", async () => {
		fetchMock
			.get(env.DESCOPE_BASE_URL)
			.intercept({ path: "/" })
			.reply(200, responseBody, {
				headers: {
					[DO_NOT_MODIFY]: DO_NOT_MODIFY,
					"Set-Cookie": cookieNames.map((name) => serialize({ name, value, options })),
					...cors,
				},
			});

		const url = new URL(`https://auth.example.com/`);
		const response = await handleRequest(new Request(url), env);
		expect(response.headers).toMatchSnapshot();
		const cookies = response.headers.getAll("Set-Cookie").map(deserialize);
		cookies.forEach((cookie) => {
			switch (cookie.name) {
				case env.DESCOPE_SESSION_COOKIE:
				case env.DESCOPE_SESION_REFRESH_COOKIE:
					expect(cookie.options?.domain).toBe(url.hostname);
					break;
				default:
					expect(cookie.options?.domain).toBe(options.domain);
			}
		});
		cookies.forEach((cookie) => {
			expect(cookieNames.includes(cookie.name)).toBeTruthy();
		});
		expect(cookies.length).toBe(cookieNames.length);
		cookies.map((cookie) => expect(cookie.value).toBe(value));
	});

	it("should NOT alter non-descope cookie domain", async () => {
		fetchMock
			.get(env.DESCOPE_BASE_URL)
			.intercept({ path: "/" })
			.reply(200, responseBody, {
				headers: {
					"Set-Cookie": serialize({ name: DO_NOT_MODIFY, value, options }),
				},
			});

		const url = new URL(`https://auth.example.com/`);
		const response = await handleRequest(new Request(url), env);
		const cookie = deserialize(response.headers.get("Set-Cookie") ?? "");
		expect(cookie.name).toBe(DO_NOT_MODIFY);
		expect(cookie.options?.domain).toBe(options.domain);
	});

	it("should not alter other headers", async () => {
		const fetchMock = getMiniflareFetchMock();
		fetchMock
			.get(env.DESCOPE_BASE_URL)
			.intercept({ path: "/" })
			.reply(200, responseBody, {
				headers: {
					[DO_NOT_MODIFY]: DO_NOT_MODIFY,
				},
			});
		const response = await handleRequest(new Request("https://auth.example.com/"), env);
		expect(response.headers.get(DO_NOT_MODIFY)).toBe(DO_NOT_MODIFY);
	});

	it("should not alter response body", async () => {
		fetchMock
			.get(env.DESCOPE_BASE_URL)
			.intercept({ path: "/" })
			.reply(200, responseBody);
		const response = await handleRequest(new Request("https://auth.example.com/"), env);
		expect(await response.text()).toBe(responseBody);
	});

	it("should alter cors headers when domain is specified", async () => {
		fetchMock
			.get(env.DESCOPE_BASE_URL)
			.intercept({ path: "/" })
			.reply(200, responseBody, {
				headers: {
					"Access-Control-Allow-Origin": new URL(env.DESCOPE_BASE_URL).hostname,
				},
			});

		const url = new URL(`https://auth.example.com/`);
		const response = await handleRequest(new Request(url), env);
		expect(response.headers.get("Access-Control-Allow-Origin")).toBe(url.hostname);
	});

	it("should NOT alter cors headers when domain is not specified", async () => {
		fetchMock
			.get(env.DESCOPE_BASE_URL)
			.intercept({ path: "/" })
			.reply(200, responseBody, {
				headers: {
					"Access-Control-Allow-Origin": "*",
				},
			});

		const url = new URL(`https://auth.example.com/`);
		const response = await handleRequest(new Request(url), env);
		expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
	});

	it("should work with all request methods", async () => {
		const fetchMock = getMiniflareFetchMock();

		const url = new URL(`https://auth.example.com/`);
		const methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"];
		methods.forEach((method) =>
			fetchMock
				.get(env.DESCOPE_BASE_URL)
				.intercept({ path: "/", method })
				.reply(200, responseBody),
		);
		const responses = await Promise.all(
			methods.map((method) => handleRequest(new Request(url, { method }), env)),
		);
		responses.forEach((response) => {
			expect(response.status).toBe(200);
		});
	});

	it("should test all mocked requests", async () => {
		const fetchMock = getMiniflareFetchMock();
		fetchMock.assertNoPendingInterceptors();
	});
});
