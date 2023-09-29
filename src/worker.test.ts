import { CookieOptions, serialize } from "./cookieParser";
import { handleRequest } from "./worker";

const env = {
	DESCOPE_BASE_URL: "https://api.descope.com",
	DESCOPE_SESSION_COOKIE: "DS",
	DESCOPE_SESION_REFRESH_COOKIE: "DSR",
};

describe("worker", () => {
	beforeEach(() => {
		const fetchMock = getMiniflareFetchMock();
		fetchMock.disableNetConnect();

		const DO_NOT_MODIFY = "DO_NOT_MODIFY";
		const value = "1234";
		const options: CookieOptions = {
			domain: new URL(env.DESCOPE_BASE_URL).hostname,
			expires: "1234",
			path: "/",
			secure: true,
			httpOnly: true,
			sameSite: "Strict",
		};

		fetchMock
			.get(env.DESCOPE_BASE_URL)
			.intercept({ path: "/" })
			.reply(200, "OK", {
				headers: {
					[DO_NOT_MODIFY]: DO_NOT_MODIFY,
					"Set-Cookie": [
						serialize({ name: env.DESCOPE_SESSION_COOKIE, value, options }),
						serialize({ name: env.DESCOPE_SESION_REFRESH_COOKIE, value, options }),
						serialize({ name: DO_NOT_MODIFY, value, options }),
					],
				},
			});
	});

	it("should alter descope cookie domain", async () => {
		const url = new URL(`https://auth.example.com/`);
		const response = await handleRequest(new Request(url), env);
		expect(response.headers).toMatchSnapshot();
	});

	it("should not alter response body", async () => {
		const url = new URL(`https://auth.example.com/`);
		const response = await handleRequest(new Request(url), env);
		expect(await response.text()).toBe("OK");
	});

	it("should work with all request methods", async () => {
		const fetchMock = getMiniflareFetchMock();

		const url = new URL(`https://auth.example.com/`);
		const methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"];
		methods.forEach((method) =>
			fetchMock
				.get(env.DESCOPE_BASE_URL)
				.intercept({ path: "/", method })
				.reply(200, "OK"),
		);
		const responses = await Promise.all(
			methods.map((method) => handleRequest(new Request(url, { method }), env)),
		);
		responses.forEach((response) => {
			expect(response.status).toBe(200);
		});
	});
});
