
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

async function sendSlackChannelMessage({ channel, email, message, token }) {
  const user = await getUserByEmail(email, token);
  const userMention = `<@${user.id}>`;
  const timestamp = getTimestamp();
  const payload = {
    channel,
    text: message.replace('USER_NAME_PLACEHOLDER', userMention),
    attachments: [
      {
        color: 'good',
        fields: [
          { title: 'User', value: userMention, short: true },
          { title: 'Timestamp', value: timestamp, short: true },
        ],
        footer: 'Automated System',
        footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
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

async function sendSlackDirectMessage({ email, message, token }) {
  const user = await getUserByEmail(email, token);
  const timestamp = getTimestamp();
  const payload = {
    channel: user.id,
    text: message.replace('USER_NAME_PLACEHOLDER', user.name),
    attachments: [
      {
        color: '#36a64f',
        fields: [
          { title: 'Direct Message', value: 'This is a private message sent directly to you.', short: false },
          { title: 'Timestamp', value: timestamp, short: true },
          { title: 'Sent By', value: 'Automated System', short: true },
        ],
        footer: 'Direct Message System',
        footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
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
  if (!data.ok) throw new Error(`Slack DM failed: ${data.error}`);
  return data;
}

module.exports = {
  sendSlackChannelMessage,
  sendSlackDirectMessage,
};
