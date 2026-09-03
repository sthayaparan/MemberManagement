# The Member Management MVP web app

## Business Requirements

This project is building a Member Management App. Key features:
- The UI should allow the user to add new member, update member, delete member and to view all available members
- The member has the following attributes at this stage of the developmet of this project:
    - Firstname
    - Surname
    - DOB
    - Postal code
    - Mobile number

- There is an AI chat feature in a sidebar; the AI is able to create / edit / delete  a     member.

## Technical Decisions

- NextJS frontend. The frontend should be in /frontend
- C# ASP.NET Core Web (REST API) with Entity Framework Core backend. The backend should be in /backend
- Use OpenRouter for the AI calls. An OPENROUTER_API_KEY is in .env in the project root
- Use `openai/gpt-oss-120b` as the model
- Use SQLLite local database for persitence, creating a new db if it doesn't exist
- Start and Stop server scripts for PC, Linux in scripts/
- Update design decisions in the corresponding AGENTS.md in /Frontend and /Backend
- Add unit test to the backend and also add unit & UI test to the frontend


## Color Scheme

- Accent Yellow: `#ecad0a` - accent lines, highlights
- Blue Primary: `#209dd7` - links, key sections
- Purple Secondary: `#753991` - submit buttons, important actions
- Dark Navy: `#032147` - main headings
- Gray Text: `#888888` - supporting text, labels

## Coding standards

1. Use latest versions of libraries and idiomatic approaches as of today
2. Keep it simple - NEVER over-engineer, ALWAYS simplify, NO unnecessary defensive programming. No extra features - focus on simplicity.
3. Be concise. Keep README minimal. IMPORTANT: no emojis ever
4. When hitting issues, always identify root cause before trying a fix. Do not guess. Prove with evidence, then fix the root cause.
