export type UserProfile = {
  username: string;
  avatarUrl: string;
  joinedAt: string;
  usernameChangedAt: string | null;
  avatarChangedAt: string | null;
  links: { leetcode: string; linkedin: string; github: string };
};

export const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
export function daysLeft(changedAt: string | Date | null, now = Date.now()) {
  if (!changedAt) return 0;
  return Math.max(
    0,
    Math.ceil((THIRTY_DAYS - (now - new Date(changedAt).getTime())) / 86400000),
  );
}

export function normalizeUsername(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const username = value.trim().toLowerCase();
  return /^[a-z0-9_]{3,20}$/.test(username) ? username : null;
}

export function normalizeHandle(
  value: unknown,
  service: "leetcode" | "github" | "linkedin",
): string | null {
  if (typeof value !== "string" || value.length > 200) return null;
  let handle = value.trim();
  if (!handle) return "";
  if (/^https?:\/\//i.test(handle)) {
    try {
      const url = new URL(handle);
      if (
        ![`${service}.com`, `www.${service}.com`].includes(url.hostname) ||
        url.port ||
        url.username ||
        url.password
      )
        return null;
      const pathPattern =
        service === "linkedin"
          ? /^\/in\/([^/]+)\/?$/
          : service === "leetcode"
            ? /^\/(?:u\/)?([^/]+)\/?$/
            : /^\/([^/]+)\/?$/;
      const match = url.pathname.match(pathPattern);
      if (!match) return null;
      handle = match[1];
    } catch {
      return null;
    }
  }
  return /^[a-zA-Z0-9_.-]{1,100}$/.test(handle) ? handle : null;
}

export function validAvatar(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 350_000) return false;
  if (!value) return true;
  if (/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+=*$/.test(value))
    return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}
