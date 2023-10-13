import { deserialize, serialize } from "./cookieParser";

/* istanbul ignore next */
export default {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return handleRequest(request, env);
	},
};

export const handleRequest = async (request: Request, env: Env) => {
	const url = new URL(request.url);
	const proxyUrl = new URL(url);
	proxyUrl.hostname = new URL(env.DESCOPE_BASE_URL).hostname;

	const res = await fetch(proxyUrl, request);
	const headers = new Headers(res.headers);
	const cookies = headers.getAll("set-cookie");
	headers.delete("set-cookie");
	cookies.forEach((value) => {
		const cookie = deserialize(value);
		switch (cookie.name) {
			case env.DESCOPE_SESSION_COOKIE:
			case env.DESCOPE_SESION_REFRESH_COOKIE:
				if (cookie.options) {
					cookie.options.domain = url.hostname;
					headers.append("x-descope-worker-proxy-cookie-modified", cookie.name);
				}
		}
		value = serialize(cookie);
		headers.append("set-cookie", value);
	});
	const cors = headers.get("access-control-allow-origin");
	if (cors && cors == new URL(env.DESCOPE_BASE_URL).origin) {
		headers.set("access-control-allow-origin", request.headers.get("origin") ?? cors);
	}
	headers.set("x-descope-worker-proxy-url", proxyUrl.href);
	return new Response(res.body, {
		...res,
		headers,
	});
};
