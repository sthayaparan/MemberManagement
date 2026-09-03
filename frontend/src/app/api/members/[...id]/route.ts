import { Member, MemberFormData } from '@/types/Member';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5156/api';

export async function GET(
  request: Request,
  { params }: { params: { id?: string } }
) {
  try {
    const id = params.id;
    const url = id ? `${BACKEND_API_URL}/members/${id}` : `${BACKEND_API_URL}/members`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return Response.json(
        { error: 'Failed to fetch members' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('[members-proxy] GET error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_API_URL}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error('[members-proxy] POST error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id?: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return Response.json({ error: 'ID is required' }, { status: 400 });
    }

    const body = await request.json();
    
    const response = await fetch(`${BACKEND_API_URL}/members/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('[members-proxy] PUT error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id?: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return Response.json({ error: 'ID is required' }, { status: 400 });
    }

    const response = await fetch(`${BACKEND_API_URL}/members/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok && response.status !== 204) {
      const errorData = await response.json();
      return Response.json(errorData, { status: response.status });
    }

    return Response.json({}, { status: 204 });
  } catch (error) {
    console.error('[members-proxy] DELETE error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
