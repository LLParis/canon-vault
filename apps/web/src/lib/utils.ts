const ISO_WITHOUT_TIMEZONE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;
const SPACE_DATETIME_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?(?:\+\d{2}:\d{2})?$/;

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function humanizeKey(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\./g, " / ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  const date = parseApiDateTime(value);
  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

export function parseApiDateTime(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  let normalized = value;
  if (ISO_WITHOUT_TIMEZONE_RE.test(value)) {
    normalized = `${value}Z`;
  } else if (SPACE_DATETIME_RE.test(value)) {
    normalized = value.replace(" ", "T");
    if (!/[+-]\d{2}:\d{2}$/.test(normalized)) {
      normalized = `${normalized}Z`;
    }
  }
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function dateSortValue(value: string | null | undefined) {
  return parseApiDateTime(value)?.getTime() ?? 0;
}

export function isLikelyDateTimeString(value: unknown) {
  if (typeof value !== "string") {
    return false;
  }

  return ISO_WITHOUT_TIMEZONE_RE.test(value) || SPACE_DATETIME_RE.test(value) || !Number.isNaN(Date.parse(value));
}

export function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatStatusLabel(value: string) {
  return humanizeKey(value);
}

export function formatJsonValue(value: unknown) {
  if (value === null || value === undefined) {
    return "Not set";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value, null, 2);
}
