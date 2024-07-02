# Main OneStudy App

## Getting started

- Clone this
- `npm install`
- Setup your `.env.local` file with the right environment variables

### Setting the ENV vars

Rename `.env.example` to `.env.local` and set the right values. Note that you will need to
get a lot of them from the appropriate services, which are named in the env file.

### Starting the Next.js server

Start the application:

```
npm run dev
```

The application should be running at [http://localhost:3000](http://localhost:3000).

### Database

The Database URL needs to be a postrgres URL.

You will need the following extensions available in your postgres instance:

```sql
CREATE EXTENSION IF NOT EXISTS "pg_uuidv7";
CREATE EXTENSION IF NOT EXISTS "vector";
```

**Note:** The first migration has these in it - so you can just run `npm run db:migrate` to set up your database.

### Inngest

[Inngest](https://www.inngest.com/) is what we use for events (queues, cron jobs, etc.). You'll need this running to complete a lot of things.

```
npm run eventserver
```

### Clerk.com local webhook testing

If you want to test the Clerk.com webhooks locally, you'll need to run the Inngest server above and send `hook/auth` events through, to test. Inngest production and "preview" environments
have their own webhook URL's that Clerk references.

#### Step one: Get a payload from Clerk.com

1. Go to the webhook section of Clerk.dev
2. Click "Testing"
3. Pick an event type
4. Copy it
5. Go to the local Inngest server, click "send event", paste the payload, and send it

For example from Clerk.com's `user.deleted` event:

```json
{
  "data": {
    "deleted": true,
    "id": "user_29wBMCtzATuFJut8jO2VNTVekS4",
    "object": "user"
  },
  "object": "event",
  "type": "user.deleted"
}
```

Should be put in a new event in Inngest like this:

```json
{
  "name": "hook/auth",
  "data": {
    "data": {
      "deleted": true,
      "id": "user_29wBMCtzATuFJut8jO2VNTVekS4",
      "object": "user"
    },
    "object": "event",
    "type": "user.deleted"
  },
  "user": {}
}
```

Once you send it, you should see it go through the local Inngest logs and also in your local environement of the app.

#### NGROK

You can also setup someting like Ngrok to send events to your local machine. You can then point the webhook in Clerk to that URL, and it will send events to your local machine. For example:

```bash
ngrok http 3000 --verify-webhook clerk --verify-webhook-secret YOUR_CLERK_WEBHOOK_SECRET_HERE
```

Then copy the URL it gives you, and paste it into the webhook URL field in Clerk.com + add `/api/auth/hook` to the end of it.

### API Keys

Each org can issue their own API keys. How it works for them:

- They go to `/settings/apikeys` and create an API key
- We will insert in to the key's metadata the "organizationId" they belong to.
- When we check the public API against their key, we will ensure that the organizationId matches the organizationId of the study and interviews they're trying to access.

The purpose for this is for the Respondent App, which is a separate app that interviewees interact with.

#### For API Keys

These need to be provisioned inside of Unkey.dev.

You can quickly create an API key for the right environment here: <https://unkey.dev/app/apis>. Give it:

- A name
- A ratelimit. e.g. 100 requests per second
- IMPORTANT: `Owner ID` should have the exact value specified in your ENV file: `API_KEY_SUPER_OWNER` We check this instead of the organizationId.

### Public API's

Moved to Notion

[Internal link](https://www.notion.so/onestudy/API-Documentation-e10acf3a2f374687ba58b26e7ab41d0c?pvs=4)

[Public link](https://onestudy.notion.site/API-Documentation-e10acf3a2f374687ba58b26e7ab41d0c?pvs=4)
