/**
 * @typedef {Object} Env
 */

export default {
	/**
	 * @param {Request} request
	 * @param {Env} env
	 * @param {ExecutionContext} ctx
	 * @returns {Promise<Response>}
	 */
	async fetch(request, env, ctx) {
		const targetApiUrl = "https://services.baxus.co/api/bar/user/";
		// Allow any origin
		const allowedOrigin = "*";

		// Construct the target URL by appending the path and query string from the original request
		const url = new URL(request.url);
		// Extract username from path, removing leading '/'
		const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);
		const username = pathSegments[0]; // Assuming username is the first segment

		// Handle cases where no username is provided in the path
		if (!username && request.method !== 'OPTIONS') { // Don't error on OPTIONS preflight for root path
			// Return a 400 Bad Request as a username is expected.
			const errorHeaders = new Headers({ 'Access-Control-Allow-Origin': allowedOrigin });
			return new Response('Username missing in path', { status: 400, headers: errorHeaders });
		}

		// Construct the target URL with the username (or base if it's an OPTIONS request for root)
		const targetPath = username ? username + url.search : url.search; // Append username and original search params
		const targetUrl = new URL(targetPath, targetApiUrl);
		console.log(`Proxying to target URL: ${targetUrl.toString()}`); // Log the target URL

		// Clone the request to modify headers for the fetch call
		const proxyRequest = new Request(targetUrl.toString(), {
			method: request.method,
			headers: request.headers,
			body: request.body,
			redirect: 'follow' // Or 'manual' depending on desired behavior
		});

		// Set the Host header to the target API's host
		proxyRequest.headers.set('Host', new URL(targetApiUrl).host);
		// Optionally preserve the original Host header if needed by the target API
		// proxyRequest.headers.set('X-Forwarded-Host', url.host);

		// Handle CORS preflight requests (OPTIONS)
		if (request.method === 'OPTIONS') {
			// Handle CORS preflight requests (OPTIONS) by allowing any origin
			const headers = new Headers();
			headers.set('Access-Control-Allow-Origin', allowedOrigin); // Set to '*'
			headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow relevant methods
			headers.set('Access-Control-Allow-Headers', '*'); // Allow any headers
			headers.set('Access-Control-Max-Age', '86400'); // Cache preflight response for 1 day
			return new Response(null, { status: 204, headers });
		}

		// Make the request to the target API
		let response;
		try {
			// Remove the Origin header before sending to the target API
			proxyRequest.headers.delete('Origin');
			response = await fetch(proxyRequest);
		} catch (error) {
			console.error('Error fetching from target API:', error);
			return new Response('Error proxying request', { status: 502 });
		}
		console.log(`Received status from target API: ${response.status}`); // Log the response status

		// Clone the response so we can modify headers
		const proxyResponse = new Response(response.body, response);

		// Set CORS headers on the actual response
		// Set CORS headers on the actual response to allow any origin
		proxyResponse.headers.set('Access-Control-Allow-Origin', allowedOrigin); // Set to '*'
		// Note: When using '*', Access-Control-Allow-Credentials cannot be 'true'.
		// If you needed credentials, you would have to reflect the specific request origin instead of using '*'.

		// Remove any Cloudflare-specific headers if necessary
		// proxyResponse.headers.delete('cf-ray');
		// proxyResponse.headers.delete('cf-connecting-ip');

		return proxyResponse;
	},
};