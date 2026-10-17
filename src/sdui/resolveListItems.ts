import { SDUIDataSource, SDUIListFilter } from './types';

function asRecord(item: unknown): Record<string, unknown> | null {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
  return item as Record<string, unknown>;
}

function readField(item: unknown, field: string): unknown {
  const record = asRecord(item);
  if (!record) return undefined;
  return record[field];
}

function leadingNumber(value: unknown): number | null {
  const match = String(value ?? '').match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function matchesFilter(item: unknown, filter: SDUIListFilter): boolean {
  const actual = readField(item, filter.field);
  const operator = filter.operator ?? (filter.value === undefined ? 'truthy' : 'eq');
  const expected = filter.value;

  switch (operator) {
    case 'truthy':
      return Boolean(actual);
    case 'falsy':
      return !actual;
    case 'eq':
      return actual === expected;
    case 'neq':
      return actual !== expected;
    case 'gt':
      return Number(actual) > Number(expected);
    case 'lt':
      return Number(actual) < Number(expected);
    case 'gte':
      return Number(actual) >= Number(expected);
    case 'lte':
      return Number(actual) <= Number(expected);
    case 'contains': {
      const needle = String(expected ?? '').toLowerCase();
      if (Array.isArray(actual)) {
        return actual.some((entry) => String(entry).toLowerCase().includes(needle));
      }
      return String(actual ?? '').toLowerCase().includes(needle);
    }
    case 'maxMinutes': {
      const minutes = leadingNumber(actual);
      if (minutes == null) return false;
      return minutes < Number(expected);
    }
    default:
      return Boolean(actual);
  }
}

function matchesLoose(item: unknown, key: string): boolean {
  const record = asRecord(item);
  if (!record) return false;

  const needle = key.toLowerCase();
  if (Array.isArray(record.tags)) {
    const tagged = record.tags.some((tag) => String(tag).toLowerCase() === needle);
    if (tagged) return true;
  }

  const haystacks = [record.category, record.cuisine, record.title, record.tag, record.id];
  return haystacks.some((value) => String(value ?? '').toLowerCase().includes(needle));
}

function isShowAll(value: unknown): boolean {
  if (value == null) return true;
  const key = String(value).trim().toLowerCase();
  return key === '' || key === 'all' || key === '*';
}

/**
 * Resolve the rows a list should render.
 * `state` + array value uses that array.
 * `state` + scalar value filters `data` with `filters[value]`, then a loose text match.
 */
export function resolveListItems(
  dataSource: SDUIDataSource | undefined,
  stateValue: unknown,
  remoteData?: unknown[] | null
): unknown[] {
  if (!dataSource) return [];

  if (dataSource.type === 'remote') {
    return Array.isArray(remoteData) ? remoteData : [];
  }

  if (dataSource.type === 'local') {
    return Array.isArray(dataSource.data) ? dataSource.data : [];
  }

  if (Array.isArray(stateValue)) return stateValue;

  const data = Array.isArray(dataSource.data) ? dataSource.data : [];
  if (isShowAll(stateValue)) return data;

  const key = String(stateValue);
  const filter = dataSource.filters?.[key];
  if (filter) return data.filter((item) => matchesFilter(item, filter));
  return data.filter((item) => matchesLoose(item, key));
}
