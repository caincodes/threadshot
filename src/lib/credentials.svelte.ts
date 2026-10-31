import { checkCredentials } from "./credentialRules";

const STORAGE_KEY = "threadshot:reddit-credentials";

export interface Credentials {
  clientId: string;
  clientSecret?: string;
}

const read = (): Credentials | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const { clientId, clientSecret } = JSON.parse(raw) as Partial<Credentials>;
    return typeof clientId === "string" && !checkCredentials(clientId, clientSecret)
      ? { clientId, clientSecret: clientSecret || undefined }
      : null;
  } catch {
    return null;
  }
};

// The visitor's own Reddit credentials. They live in this browser only; the
// server receives them with each request and never stores them.
class CredentialStore {
  value = $state<Credentials | null>(read());

  save(next: Credentials) {
    this.value = next;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage blocked (private mode): keep them in memory for this visit.
    }
  }

  forget() {
    this.value = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing stored, nothing to remove.
    }
  }
}

export const credentials = new CredentialStore();
