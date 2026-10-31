// Shared by the form (so mistakes are caught before sending) and the server
// (which never trusts the client).
export const CLIENT_ID_PATTERN = /^[\w-]{8,40}$/;
export const CLIENT_SECRET_PATTERN = /^[\w-]{8,80}$/;

export const checkCredentials = (
  clientId: string,
  clientSecret?: string
): string | null => {
  if (!CLIENT_ID_PATTERN.test(clientId)) {
    return "That doesn't look like a client ID. It's the short code under your app's name on reddit.com/prefs/apps.";
  }
  if (clientSecret && !CLIENT_SECRET_PATTERN.test(clientSecret)) {
    return "That doesn't look like a client secret. Leave it empty for an installed app.";
  }
  return null;
};
