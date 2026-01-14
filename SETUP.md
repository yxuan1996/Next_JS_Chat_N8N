# Chat App - Setup Instructions

## Prerequisites
- Node.js 18+ installed
- A Supabase account
- An n8n webhook URL
- Git installed

## Step 1: Create Next.js App

```bash
npx create-next-app@latest chat_app
```

When prompted, select:
- ❌ TypeScript: No
- ✅ ESLint: Yes
- ✅ Tailwind CSS: Yes
- ❌ src/ directory: No
- ✅ App Router: Yes
- ❌ Customize default import alias: No

```bash
cd chat_app
```

## Step 2: Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install @radix-ui/react-dialog @radix-ui/react-slot
npm install class-variance-authority clsx tailwind-merge lucide-react tw-animate-css
npm install tailwindcss postcss autoprefixer
npm install jsonwebtoken
```

## Step 3: Initialize Shadcn UI

https://stackoverflow.com/questions/79393879/error-installing-shadcn-ui-and-tailwind-css-in-react-js-project-with-vite

We are using Tailwind v4 and React 19, we need to install the canary version
```
npx shadcn@canary init
```


Select:
- Style: Default
- Base color: Slate
- CSS variables: Yes

Install components:
```bash
npx shadcn@canary add button
npx shadcn@canary add input
npx shadcn@canary add card
npx shadcn@canary add dialog
npx shadcn@canary add scroll-area
```

## Step 4: Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Project Settings > API
3. Copy your project URL and anon public key

4. In your Supabase SQL Editor, run this SQL to create the tables:

```sql

-- Create chat_sessions table
CREATE TABLE n8n_chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX idx_user_email ON n8n_chat_sessions(user_email);

-- Disable RLS for simplicity (or create policies if you prefer)
ALTER TABLE n8n_chat_sessions DISABLE ROW LEVEL SECURITY;

-- Create n8n_chat_messages table
CREATE TABLE n8n_chat_messages (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  message JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX idx_session_id ON n8n_chat_messages(session_id);

-- Disable RLS for simplicity
ALTER TABLE n8n_chat_messages DISABLE ROW LEVEL SECURITY;

-- Enable Realtime for n8n_chat_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE n8n_chat_messages;

```

## Step 5: Setup Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
N8N_WEBHOOK_URL=your_n8n_webhook_url
N8N_JWT_SECRET=your_n8n_webhook_secret
NEXT_API_URL=depends
```

The NEXT_API_URL depends on your environment. 
- When running locally use `http://127.0.0.1:3000`
- When deployed on vercel use the vercel URL



## Step 6: Project Structure

Your project should have this structure:

```
chat_app/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.js
│   │   ├── messages/
│   │   │   └── route.js
│   │   └── sessions/
│   │       └── route.js
│   ├── chat/
│   │   └── page.js
│   ├── layout.js
│   └── page.js
├── components/
│   ├── ui/
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── dialog.jsx
│   │   ├── input.jsx
│   │   └── scroll-area.jsx
│   ├── AuthForm.js
│   ├── ChatInterface.js
│   └── ChatList.js
├── lib/
│   ├── supabase.js
│   └── utils.js
├── .env.local
└── package.json
```

## Step 7: Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add all environment variables from `.env.local`
4. Deploy!

## Step 8: Configure n8n Webhook

Your n8n webhook should:
1. Accept POST requests with `{ message, sessionId }`
2. Use the sessionId to maintain conversation context
3. Return response in this format: `[{ "output": "your response here" }]`

Example n8n webhook response format:
```json
[
  {
    "output": "Hello! How can I help you?"
  }
]
```

**Note:** The app generates and manages sessionIds - n8n just needs to use them for context.

## Troubleshooting

Note: Use "http://127.0.0.1:3000" instead of request.nextUrl.origin for internal APIs.
This will help us to avoid SSL issues when deploying into docker or kubernetes. 

- **SSL/Connection errors:** 
  - Make sure you're using the "Session mode" connection string from Supabase, not "Transaction mode"
  - Verify your database password is correct in the connection string
  - For local development, the code automatically handles SSL settings
- **Authentication not working:** Check your Supabase URL and keys
- **Database errors:** Verify DATABASE_URL connection string
- **n8n not responding:** Test your webhook URL directly with this payload:
  ```json
  {
    "message": "Hello",
    "sessionId": "test-123"
  }
  ```
  Verify it returns: `[{ "output": "your response" }]`
- **Build errors:** Make sure all dependencies are installed
- **Session not saving:** Check that postgres table was created correctly
