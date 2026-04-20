import { NextRequest, NextResponse } from 'next/server';

// Use the correct API endpoint from the documentation
const PSGC_API_BASE = 'https://psgc.cloud/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Await the params Promise (required in Next.js 15)
    const { path } = await params;
    const pathString = path.join('/');
    const url = `${PSGC_API_BASE}/${pathString}`;
    
    console.log('Proxying request to:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS/14)',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      console.error(`API responded with status: ${response.status}`);
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      return NextResponse.json(
        { error: `API returned ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log(`Successfully fetched ${pathString}, got ${Array.isArray(data) ? data.length : 'object'} items`);
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error: any) {
    console.error('Proxy error details:', {
      message: error.message,
      code: error.code,
      cause: error.cause
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch data from external API',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}