import { NextResponse } from 'next/server';

const SLACK_API = 'https://slack.com/api';

async function getUserByEmail(email, token) {
  const res = await fetch(`${SLACK_API}/users.lookupByEmail?email=${encodeURIComponent(email)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Slack user lookup failed: ${data.error}`);
  return {
    id: data.user.id,
    name: data.user.profile.display_name || data.user.name,
  };
}

function getTimestamp() {
  return new Date().toLocaleString('en-US', { timeZoneName: 'short' });
}

async function sendSlackChannelMessage({ channel, email, message, token, link, title }) {
  const user = await getUserByEmail(email, token);
  const userMention = `<@${user.id}>`;
  const timestamp = getTimestamp();
  const payload = {
    channel,
    text: message,
    attachments: [
      {
        color: 'good',
        fields: [
          { title: 'Project Lead', value: userMention, short: true },
          { title: 'Project Title', value: title, short: true },
          {title: 'Link', value: `<${link}|Click here>`, short: true},
        ]
      },
    ],
  };
  const res = await fetch(`${SLACK_API}/chat.postMessage`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Slack channel message failed: ${data.error}`);
  return data;
}

export async function POST(req) {
  try {
    const { channel, email, message, title, link } = await req.json();
    const token = process.env.SLACK_BOT_TOKEN;
    if (!token) throw new Error('SLACK_BOT_TOKEN not set in environment');
    const result = await sendSlackChannelMessage({ channel, email, message, token, link, title });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
