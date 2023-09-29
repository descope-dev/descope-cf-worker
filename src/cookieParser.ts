export interface CookieOptions {
	expires?: string;
	maxAge?: number;
	domain?: string;
	path?: string;
	secure?: boolean;
	httpOnly?: boolean;
	sameSite?: "Strict" | "Lax" | "None";
	[key: string]: string | number | boolean | undefined;
}

interface Cookie {
	name: string;
	value: string;
	options?: CookieOptions;
}

/**
 * Parses a "Set-Cookie" header and returns an object containing the cookie name,
 * value, and options as per the HTTP standard.
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
 *
 * @param setCookieHeader - The "Set-Cookie" header string to parse.
 * @throws {Error} If the input does not match the expected format.
 * @returns An object with the cookie name, value, and options.
 */
export const deserialize = (setCookieHeader: string): Cookie => {
	const cookieRegex = /^([^=]+)=([^;]+);\s*(.*)$/;
	const match = setCookieHeader.match(cookieRegex);

	if (!match) {
		throw new Error("Invalid Set-Cookie header format");
	}

	const name = match[1];
	const value = match[2];
	const optionsString = match[3] || "";

	const options: CookieOptions = {};

	// Split options string by semicolons and trim whitespace
	const optionPairs = optionsString.split(";").map((option) => option.trim());

	for (const optionPair of optionPairs) {
		const [optionName, optionValue] = optionPair.split("=").map((part) => part.trim());

		if (optionName) {
			// Parse known options
			switch (optionName.toLowerCase()) {
				case "expires":
					options.expires = optionValue;
					break;
				case "max-age":
					options.maxAge = Number(optionValue);
					break;
				case "domain":
					options.domain = optionValue;
					break;
				case "path":
					options.path = optionValue;
					break;
				case "secure":
					options.secure = true;
					break;
				case "httponly":
					options.httpOnly = true;
					break;
				case "samesite":
					options.sameSite = optionValue as "Strict" | "Lax" | "None";
					break;
			}
		}
	}

	return { name, value, options };
};

/**
 * Constructs a "Set-Cookie" header string from a cookie name, value, and options object
 * as per the HTTP standard.
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
 *
 * @param name - The name of the cookie.
 * @param value - The value of the cookie.
 * @param options - An object containing cookie options.
 * @returns A "Set-Cookie" header string.
 */
export const serialize = ({ name, value, options }: Cookie): string => {
	const parts: string[] = [];

	// Add the name and value to the header
	parts.push(`${name}=${value}`);

	if (options) {
		// Add known options to the header
		if (options.expires) {
			parts.push(`Expires=${options.expires}`);
		}
		if (options.maxAge !== undefined) {
			parts.push(`Max-Age=${options.maxAge}`);
		}
		if (options.domain) {
			parts.push(`Domain=${options.domain}`);
		}
		if (options.path) {
			parts.push(`Path=${options.path}`);
		}
		if (options.secure) {
			parts.push("Secure");
		}
		if (options.httpOnly) {
			parts.push("HttpOnly");
		}
		if (options.sameSite) {
			parts.push(`SameSite=${options.sameSite}`);
		}
	}

	return parts.join("; ");
};
