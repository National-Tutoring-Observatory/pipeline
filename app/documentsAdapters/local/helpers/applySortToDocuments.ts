import each from 'lodash/each';
import orderBy from 'lodash/orderBy';
import type { SortParam } from '~/modules/documents/documents.types';

export function applySortToDocuments(data: any[], sort: SortParam): any[] {
  if (!sort) return data;
  if (typeof sort === 'string') return applySortString(data, sort);
  if (Array.isArray(sort)) return applySortArray(data, sort);
  return applySortObject(data, sort);
}

function applySortObject(data: any[], sort: Record<string, any>): any[] {
  if (Object.keys(sort).length === 0) {
    return data;
  }

  const iteratees: string[] = [];
  const orders: Array<'asc' | 'desc'> = [];

  each(sort, (sortValue, sortKey) => {
    iteratees.push(sortKey);
    const sortOrder = normalizeSortValue(sortValue);
    orders.push(sortOrder);
  });

  return orderBy(data, iteratees, orders);
}

function applySortString(data: any[], sort: string): any[] {
  const sortPairs = sort.split(' ').filter(s => s);
  const iteratees: string[] = [];
  const orders: Array<'asc' | 'desc'> = [];

  for (const pair of sortPairs) {
    if (pair.startsWith('-')) {
      iteratees.push(pair.substring(1));
      orders.push('desc');
    } else {
      iteratees.push(pair);
      orders.push('asc');
    }
  }

  return iteratees.length > 0 ? orderBy(data, iteratees, orders) : data;
}

function applySortArray(data: any[], sort: Array<[string, 'asc' | 'desc']>): any[] {
  const iteratees: string[] = [];
  const orders: Array<'asc' | 'desc'> = [];

  for (const [field, order] of sort) {
    iteratees.push(field);
    orders.push(order);
  }

  return iteratees.length > 0 ? orderBy(data, iteratees, orders) : data;
}

function normalizeSortValue(value: any): 'asc' | 'desc' {
  if (value === -1 || value === 'desc') {
    return 'desc';
  }
  return 'asc';
}

export default applySortToDocuments;
