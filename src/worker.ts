import { deserialize, serialize } from "./cookieParser";

/* istanbul ignore next */
export default {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return handleRequest(request, env);
	},
};

export const handleRequest = async (request: Request, env: Env) => {
	const descopeUrl = env.DESCOPE_BASE_URL;
	const url = new URL(request.url);

	const res = await fetch(descopeUrl, request);
	const headers = new Headers(res.headers);
	const cookies = headers.getAll("set-cookie");
	headers.delete("set-cookie");
	cookies.forEach((value) => {
		const cookie = deserialize(value);
		switch (cookie.name) {
			case env.DESCOPE_SESSION_COOKIE:
			case env.DESCOPE_SESION_REFRESH_COOKIE:
				if (cookie.options) cookie.options.domain = url.hostname;
		}
		value = serialize(cookie);
		headers.append("set-cookie", value);
	});
	const cors = headers.get("access-control-allow-origin");
	if (cors && cors !== "*") {
		headers.set("access-control-allow-origin", url.hostname);
	}
	return new Response(res.body, {
		...res,
		headers,
	});
};
