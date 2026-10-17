function loopback(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]';
}

function hostMatches(hostname: string, allowedOrigins: readonly string[]): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  return allowedOrigins.some((entry) => {
    const rule = entry.trim().toLowerCase();
    if (rule.startsWith('*.')) {
      const suffix = rule.slice(2);
      return suffix.length > 0 && (host === suffix || host.endsWith(`.${suffix}`));
    }
    return host === rule;
  });
}

/**
 * Remote schema URLs must be https, or http on loopback, and the host must be listed.
 * Userinfo and every other scheme is rejected.
 */
export function isUrlAllowed(raw: string, allowedOrigins: readonly string[]): boolean {
  if (typeof raw !== 'string' || raw.trim() === '' || allowedOrigins.length === 0) return false;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }

  if (url.username || url.password) return false;
  if (url.protocol === 'http:') {
    if (!loopback(url.hostname)) return false;
  } else if (url.protocol !== 'https:') {
    return false;
  }

  return hostMatches(url.hostname, allowedOrigins);
}

export function normalizeOrigin(entry: string): string {
  const trimmed = entry.trim().toLowerCase();
  if (!trimmed) return '';
  if (trimmed.includes('://')) {
    try {
      return new URL(trimmed).hostname;
    } catch {
      return '';
    }
  }
  return trimmed;
}
