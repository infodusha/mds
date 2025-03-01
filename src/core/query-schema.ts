import { parseAsFloat, parseAsInteger, parseAsArrayOf, parseAsString } from 'nuqs';

export const DEFAULT_MAX_DURATION = 240; // in minutes
export const DEFAULT_MIN_RATING = 0;

export const querySchema = {
  q: { defaultValue: '', throttleMs: 500 },
  d: parseAsInteger.withDefault(DEFAULT_MAX_DURATION),
  g: parseAsArrayOf(parseAsString).withDefault([]),
  t: parseAsArrayOf(parseAsString).withDefault([]),
  r: parseAsFloat.withDefault(DEFAULT_MIN_RATING),
};
