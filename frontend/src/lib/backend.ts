// Base URL of the ASP.NET Core backend. Read server-side only, by the Next.js
// API proxy routes under app/api - the browser never sees it.
export const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5156/api';

// Proxy a request to the backend and pass its JSON body and status straight
// through. A transport failure (backend down) becomes the API's { error, code }
// envelope so the client always receives parseable JSON.
export async function proxyToBackend(
  path: string,
  init?: RequestInit
): Promise<Response> {
  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${BACKEND_API_URL}${path}`, init);
  } catch {
    return Response.json(
      { error: 'Cannot reach the members service', code: 'BACKEND_UNAVAILABLE' },
      { status: 502 }
    );
  }

  if (backendResponse.status === 204) {
    return new Response(null, { status: 204 });
  }

  const data = await backendResponse.json();
  return Response.json(data, { status: backendResponse.status });
}
