import { describe, expect, it } from 'vitest';
import filterDocumentsByMatch from '../helpers/filterDocumentsByMatch';

const docs = [
  {
    _id: '1',
    name: 'alpha',
    num: 1,
    flag: true,
    tags: ['x', 'y'],
    objs: [{ k: 'v1', num: 1 }],
    nested: { deep: { leafs: ['x', 'z'] } }
  },
  {
    _id: '2',
    name: 'ALPHA',
    num: 2,
    flag: false,
    tags: ['y'],
    objs: [{ k: 'v2', num: 2 }],
    nested: { deep: { leafs: ['y'] } }
  },
  {
    _id: '3',
    name: 'beta',
    num: 1,
    flag: true,
    tags: [],
    objs: [],
    nested: { deep: { leafs: [] } }
  },
  {
    _id: '4',
    name: 'delta',
    num: 3,
    flag: false,
    tags: ['z'],
    objs: [{ k: 'v1', num: 3 }, { k: 'v3', num: 5 }],
    nested: { deep: { leafs: ['z'] } }
  }
]

describe('filterDocumentsByMatch — full matrix', () => {

  // Basic equality
  it('matches scalar equality', () => {
    const res = filterDocumentsByMatch(docs, { name: 'alpha' })
    expect(res.map(d => d._id)).toEqual(['1'])
  })

  it('doesnt match scalar equality when case differs', () => {
    const res = filterDocumentsByMatch(docs, { name: 'Zeta' })
    expect(res.map(d => d._id)).toEqual([])
  })

  it('does not match when the field is missing for equality', () => {
    const res = filterDocumentsByMatch(docs, { missingField: 'x' })
    expect(res.length).toBe(0)
  })

  // Arrays & $in
  it('matches Array equality (value in array)', () => {
    const res = filterDocumentsByMatch(docs, { tags: 'x' })
    expect(res.map(d => d._id)).toEqual(['1'])
  })

  it('doesnt match Array equality when value not present', () => {
    const res = filterDocumentsByMatch(docs, { tags: 'w' })
    expect(res.map(d => d._id)).toEqual([])
  })

  it('matches $in for array fields (single)', () => {
    const res = filterDocumentsByMatch(docs, { tags: { $in: ['y'] } })
    expect(res.map(d => d._id).sort()).toEqual(['1', '2'])
  })

  it('matches $in for array fields with multiple values', () => {
    const res = filterDocumentsByMatch(docs, { tags: { $in: ['x', 'z'] } })
    expect(res.map(d => d._id).sort()).toEqual(['1', '4'])
  })

  it('$in with empty array returns no matches', () => {
    const res = filterDocumentsByMatch(docs, { tags: { $in: [] } })
    expect(res.length).toBe(0)
  })

  it('$in with non-array value is treated as invalid and returns no matches', () => {
    const res = filterDocumentsByMatch(docs, { tags: { $in: 'y' } })
    expect(res.length).toBe(0)
  })

  // Regex cases
  it('matches $regex (string pattern + $options) case-insensitive', () => {
    const res = filterDocumentsByMatch(docs, { name: { $regex: '^a', $options: 'i' } })
    expect(res.map(d => d._id).sort()).toEqual(['1', '2'])
  })

  it('matches $regex when $regex is a RegExp object (case-sensitive)', () => {
    const res = filterDocumentsByMatch(docs, { name: { $regex: /^A/ } })
    expect(res.map(d => d._id)).toEqual(['2'])
  })

  it('matches $regex when $regex is a RegExp object with i flag', () => {
    const res = filterDocumentsByMatch(docs, { name: { $regex: /^a/i } })
    expect(res.map(d => d._id).sort()).toEqual(['1', '2'])
  })

  it('matches $regex when $regex is a string without $options (case-sensitive)', () => {
    const res = filterDocumentsByMatch(docs, { name: { $regex: 'alpha' } })
    expect(res.map(d => d._id)).toEqual(['1'])
  })

  it('returns no matches for $regex string that does not match', () => {
    const res = filterDocumentsByMatch(docs, { name: { $regex: '^z' } })
    expect(res.length).toBe(0)
  })

  it('returns no matches for invalid $regex string', () => {
    const res = filterDocumentsByMatch(docs, { name: { $regex: '[a-' } })
    expect(res.length).toBe(0)
  })

  it('$regex with invalid $options flag is caught and returns no matches', () => {
    const res = filterDocumentsByMatch(docs, { name: { $regex: 'a', $options: 'z' } })
    expect(res.length).toBe(0)
  })

  it('matches regex against numeric fields (coerces to string)', () => {
    const res = filterDocumentsByMatch(docs, { num: { $regex: '^1' } })
    expect(res.map(d => d._id).sort()).toEqual(['1', '3'])
  })

  it('matches $regex applied directly to array field (tags)', () => {
    const res = filterDocumentsByMatch(docs, { tags: { $regex: '^x' } })
    expect(res.map(d => d._id).sort()).toEqual(['1'])
  })

  // Nested fields
  it('matches nested dotted path nested.deep.leafs', () => {
    const res = filterDocumentsByMatch(docs, { 'nested.deep.leafs': 'x' })
    expect(res.map(d => d._id)).toEqual(['1'])
  })

  it('matches explicit equality on nested objs.k', () => {
    const res = filterDocumentsByMatch(docs, { 'objs.k': 'v1' })
    expect(res.map(d => d._id).sort()).toEqual(['1', '4'])
  })

  it('matches $regex inside nested arrays (objs.k)', () => {
    const res = filterDocumentsByMatch(docs, { 'objs.k': { $regex: '^v1' } })
    expect(res.map(d => d._id).sort()).toEqual(['1', '4'])
  })

  // $ne operator
  it('$ne should exclude equal items (negative check)', () => {
    const res = filterDocumentsByMatch(docs, { name: { $ne: 'alpha' } })
    expect(res.map(d => d._id).includes('1')).toBe(false)
  })

  it('handles $ne for scalars', () => {
    const res = filterDocumentsByMatch(docs, { name: { $ne: 'alpha' } })
    expect(res.map(d => d._id).sort()).toEqual(['2', '3', '4'])
  })

  it('handles $ne when doc field is array and $ne is scalar', () => {
    const res = filterDocumentsByMatch(docs, { tags: { $ne: 'x' } })
    expect(res.map(d => d._id).sort()).toEqual(['2', '3', '4'])
  })

  it('handles $ne when comparing arrays (array vs array)', () => {
    const docs2 = [
      { _id: 'a', vals: [1, 2, 3] },
      { _id: 'b', vals: [1, 3, 2] },
      { _id: 'c', vals: [1, 2] },
      { _id: 'd', vals: [] }
    ]
    const res = filterDocumentsByMatch(docs2, { vals: { $ne: [1, 2, 3] } })
    expect(res.map(d => d._id).sort()).toEqual(['b', 'c', 'd'])
  })

  // Logical operators
  it('matches $or at top-level combining different selectors', () => {
    const res = filterDocumentsByMatch(docs, { $or: [{ name: 'alpha' }, { tags: { $in: ['z'] } }] })
    expect(res.map(d => d._id).sort()).toEqual(['1', '4'])
  })

  it('$or with no branch matching returns empty', () => {
    const res = filterDocumentsByMatch(docs, { $or: [{ name: 'zzz' }, { tags: { $in: ['qq'] } }] })
    expect(res.length).toBe(0)
  })

  it('$or provided as non-array returns no matches', () => {
    const res = filterDocumentsByMatch(docs, { $or: { name: 'alpha' } as any })
    expect(res.length).toBe(0)
  })

  it('matches $and at top-level combining selectors', () => {
    const res = filterDocumentsByMatch(docs, { $and: [{ tags: { $in: ['x'] } }, { 'nested.deep.leafs': 'x' }] })
    expect(res.map(d => d._id)).toEqual(['1'])
  })

  it('$and requires all branches to match (negative when one branch fails)', () => {
    const res = filterDocumentsByMatch(docs, { $and: [{ name: 'alpha' }, { tags: { $in: ['z'] } }] })
    // name 'alpha' is doc 1, tags 'z' is doc 4; no single doc satisfies both
    expect(res.length).toBe(0)
  })

  it('$and provided as non-array returns no matches', () => {
    const res = filterDocumentsByMatch(docs, { $and: { name: 'alpha' } as any })
    expect(res.length).toBe(0)
  })

  it('nested $and inside $or matches when any branch (and its sub-clauses) match', () => {
    const res = filterDocumentsByMatch(docs, { $or: [{ $and: [{ name: 'alpha' }, { tags: { $in: ['x'] } }] }, { name: 'delta' }] })
    // should match doc 1 (alpha & tags x) and doc 4 (delta)
    expect(res.map(d => d._id).sort()).toEqual(['1', '4'])
  })

  // Additional recommended tests
  it('returns all docs for empty match (match-all)', () => {
    const res = filterDocumentsByMatch(docs, {})
    expect(res.map(d => d._id).sort()).toEqual(['1', '2', '3', '4'])
  })

  it('matches boolean equality for true/false', () => {
    const tr = filterDocumentsByMatch(docs, { flag: true })
    expect(tr.map(d => d._id).sort()).toEqual(['1', '3'])
    const fl = filterDocumentsByMatch(docs, { flag: false })
    expect(fl.map(d => d._id).sort()).toEqual(['2', '4'])
  })

  it('does not throw and returns no-match for $regex against missing/null fields', () => {
    const res = filterDocumentsByMatch(docs, { missingField: { $regex: '^' } })
    expect(res.length).toBe(0)
    const resEqNull = filterDocumentsByMatch(docs, { missingField: null })
    expect(resEqNull.length).toBe(0)
  })

  it('does not match $regex when array contains only null/undefined elements', () => {
    const docs2 = [
      { _id: 'n1', tags: [null] },
      { _id: 'n2', tags: [undefined] },
      { _id: 'n3', tags: [] }
    ]
    const res = filterDocumentsByMatch(docs2 as any, { tags: { $regex: '^' } })
    expect(res.length).toBe(0)
  })

  it('matches $regex in array with nulls but also matching strings', () => {
    const docs2 = [
      { _id: 'a', tags: [null, 'x'] },
      { _id: 'b', tags: [null] }
    ]
    const res = filterDocumentsByMatch(docs2 as any, { tags: { $regex: '^x' } })
    expect(res.map(d => d._id)).toEqual(['a'])
  })

  it('$ne treats empty arrays as not-equal to scalar (empty array should match $ne scalar)', () => {
    // doc 3 has tags: []
    const res = filterDocumentsByMatch(docs, { tags: { $ne: 'x' } })
    expect(res.map(d => d._id).includes('3')).toBe(true)
  })

  // Other negative/edge cases
  it('returns no matches for $in with non-overlapping values', () => {
    const res = filterDocumentsByMatch(docs, { tags: { $in: ['qq'] } })
    expect(res.length).toBe(0)
  })

  it('plain object condition does not deep-match array objects (no implicit deep-equal)', () => {
    const res = filterDocumentsByMatch(docs, { objs: { k: 'v1' } })
    expect(res.length).toBe(0)
  })

})
