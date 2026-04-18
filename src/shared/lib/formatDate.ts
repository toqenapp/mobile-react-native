export function formatDate(value?: string | number | null) {
  if (!value) return null;

  try {
    return new Date(value).toLocaleString();
  } catch {
    return null;
  }
}
