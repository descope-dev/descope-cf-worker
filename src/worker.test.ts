import { CookieOptions, deserialize, serialize } from "./cookieParser";
import { handleRequest } from "./worker";

describe("fetch", () => {
	it("should fetch data from the server", async () => {
		const DESCOPE_SESSION_COOKIE = "DS";
		const DESCOPE_SESION_REFRESH_COOKIE = "DSR";

		const testUrl = new URL("https://httpbin.org/response-headers");
		const value = "1234";
		const options: CookieOptions = {
			domain: "api.descope.com",
			expires: Date.now().toString(),
			path: "/",
			secure: true,
			httpOnly: true,
			sameSite: "Strict",
		};

		const DO_NOT_MODIFY = "DO_NOT_MODIFY";

		testUrl.searchParams.append(
			"Set-Cookie",
			serialize({ name: DESCOPE_SESSION_COOKIE, value, options }),
		);
		testUrl.searchParams.append(
			"Set-Cookie",
			serialize({ name: DESCOPE_SESION_REFRESH_COOKIE, value, options }),
		);
		testUrl.searchParams.append(
			"Set-Cookie",
			serialize({ name: DO_NOT_MODIFY, value, options }),
		);
		testUrl.searchParams.append(DO_NOT_MODIFY, DO_NOT_MODIFY);

		const env: Env = {
			DESCOPE_BASE_URL: testUrl.href,
		};

		const origin = "auth.example.com";
		const url = `https://${origin}/`;

		const response = await handleRequest(new Request(url), env);

		response.headers.forEach((value, name) => {
			if (name === "Set-Cookie") {
				const cookie = deserialize(value);
				if (
					cookie.name === DESCOPE_SESSION_COOKIE ||
					cookie.name == DESCOPE_SESION_REFRESH_COOKIE
				)
					// DS/DSR cookies should have their domain set to the origin
					expect(cookie.options).toMatchObject({ ...options, domain: origin });
				else {
					// other cookies should have their domain unchanged
					expect(cookie.options).toMatchObject(options);
				}
			}
			// other headers should be passed through
			if (name === DO_NOT_MODIFY) expect(value).toBe(DO_NOT_MODIFY);
		});
	});
});
