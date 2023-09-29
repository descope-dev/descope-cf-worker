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
	const updatedHeaders = new Headers(
		res.headers
			.getAll("set-cookie")
			.map(deserialize)
			.map((cookie) => {
				if (
					cookie.name === env.DESCOPE_SESSION_COOKIE ||
					cookie.name === env.DESCOPE_SESION_REFRESH_COOKIE
				) {
					cookie.options = cookie.options || {};
					cookie.options.domain = url.hostname;
				}
				return ["set-cookie", serialize(cookie)];
			}),
	);

	res.headers.forEach((value, key) => {
		if (key != "set-cookie") updatedHeaders.set(key, value);
	});
	return new Response(res.body, {
		...res,
		headers: updatedHeaders,
	});
};
