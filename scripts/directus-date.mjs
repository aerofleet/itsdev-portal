const KOREA_OFFSET = '+09:00';

export function parseDirectusDate(value) {
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return new Date(`${text}T00:00:00${KOREA_OFFSET}`);
  }
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(text) && !/(?:Z|[+-]\d{2}:?\d{2})$/i.test(text)) {
    return new Date(`${text.replace(' ', 'T')}${KOREA_OFFSET}`);
  }
  return new Date(text);
}
