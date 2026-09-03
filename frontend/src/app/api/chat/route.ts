const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'openai/gpt-oss-120b';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface MemberSummary {
  id: number;
  firstName: string;
  surname: string;
}

function buildSystemPrompt(members: MemberSummary[]): string {
  return `You are a helpful assistant managing member records. Existing members (use their "id" to identify who an edit/delete refers to):
${JSON.stringify(members)}

When the user requests to create, edit, or delete a member, respond with ONLY a JSON object in this format:

{
  "action": "create|edit|delete",
  "member": {
    "id": "number (required for edit/delete, omit for create)",
    "firstName": "string",
    "surname": "string",
    "dateOfBirth": "YYYY-MM-DD",
    "postalCode": "string",
    "mobileNumber": "string"
  },
  "message": "friendly confirmation message"
}

For edit, only include the fields being changed plus "id". If the user is not asking for a member operation, respond with ONLY:
{
  "action": null,
  "message": "your response"
}`;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('[api/chat] OPENROUTER_API_KEY is not configured');
    return Response.json({ error: 'AI chat is not configured' }, { status: 500 });
  }

  try {
    const { messages, members } = (await request.json()) as {
      messages: ChatMessage[];
      members: MemberSummary[];
    };

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: buildSystemPrompt(members ?? []) },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      console.error(`[api/chat] OpenRouter request failed: ${response.status}`);
      return Response.json({ error: 'Failed to get AI response' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    try {
      return Response.json(JSON.parse(content));
    } catch {
      return Response.json({ action: null, message: content });
    }
  } catch (error) {
    console.error('[api/chat] error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
