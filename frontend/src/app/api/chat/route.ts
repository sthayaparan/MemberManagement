const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'openai/gpt-oss-120b';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface IncomingMember {
  id: number;
  firstName: string;
  surname: string;
}

function buildSystemPrompt(members: IncomingMember[]): string {
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

// Models often wrap JSON in ```json fences or add a sentence before it. Pull out
// the first balanced { ... } block (ignoring braces inside strings) and parse
// that; return null if there is none.
function extractJson(content: string): unknown | null {
  const start = content.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < content.length; i++) {
    const ch = content[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) {
      try {
        return JSON.parse(content.slice(start, i + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
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
      members: IncomingMember[];
    };

    // Only the id and name are needed to identify a member; do not send DOB,
    // postal code or mobile number to the third-party model.
    const memberContext = (members ?? []).map(({ id, firstName, surname }) => ({
      id,
      firstName,
      surname,
    }));

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: buildSystemPrompt(memberContext) },
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

    const parsed = extractJson(content);
    if (parsed && typeof parsed === 'object') {
      return Response.json(parsed);
    }
    return Response.json({ action: null, message: content });
  } catch (error) {
    console.error('[api/chat] error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
