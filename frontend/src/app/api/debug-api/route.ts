export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
  
  try {
    console.log(`[debug-api] Attempting to fetch from: ${apiUrl}/members`);
    
    const response = await fetch(`${apiUrl}/members`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log(`[debug-api] Response status: ${response.status}`);
    
    const data = await response.json();
    
    return Response.json({
      success: true,
      status: response.status,
      apiUrl,
      dataLength: data.data ? data.data.length : 0,
      firstMember: data.data ? data.data[0] : null,
      fullResponse: data,
    });
  } catch (error) {
    console.error('[debug-api] Error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      apiUrl,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorStack: error instanceof Error ? error.stack : null,
    }, { status: 500 });
  }
}
