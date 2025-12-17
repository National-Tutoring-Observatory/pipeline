import { describe, expect, it } from 'vitest'
import buildQueryFromParams from '../helpers/buildQueryFromParams'

describe('buildQueryFromParams', () => {
  it('builds a single-field regex match when one searchable field is provided', () => {
    const query = buildQueryFromParams({
      match: {},
      queryParams: { searchValue: 'foo' },
      searchableFields: ['name'],
      sortableFields: ['name'],
    })

    expect(query.match).toEqual({
      name: { $regex: /foo/i },
    })
  })

  it('builds an $or when multiple searchable fields are provided', () => {
    const query = buildQueryFromParams({
      match: {},
      queryParams: { searchValue: 'bar' },
      searchableFields: ['name', 'description'],
      sortableFields: ['name'],
    })

    expect(query.match.$or).toEqual([
      { name: { $regex: /bar/i } },
      { description: { $regex: /bar/i } },
    ])
  })

  it('escapes regex special characters in search values', () => {
    const query = buildQueryFromParams({
      match: {},
      queryParams: { searchValue: 'a.b' },
      searchableFields: ['name'],
      sortableFields: ['name'],
    })

    const regex = (query.match as any).name.$regex
    expect(regex).toBeInstanceOf(RegExp)
    expect(regex.source).toBe('a\\.b')
    expect(regex.flags).toContain('i')
  })

  it('throws when searchValue provided but no searchableFields configured', () => {
    expect(() =>
      buildQueryFromParams({
        match: {},
        queryParams: { searchValue: 'x' },
        // explicitly no searchable fields
        searchableFields: [],
        sortableFields: ['name'],
      })
    ).toThrow()
  })

  it('applies filters correctly', () => {
    const query = buildQueryFromParams({
      match: {},
      queryParams: { filters: { team: 'team1' } },
      searchableFields: [],
      sortableFields: ['name'],
      filterableFields: ['team'],
    })

    expect(query.match).toEqual({
      team: 'team1'
    })
  })

  it('applies multiple filters correctly', () => {
    const query = buildQueryFromParams({
      match: {},
      queryParams: { filters: { team: 'team1', status: 'active' } },
      searchableFields: [],
      sortableFields: ['name'],
      filterableFields: ['team', 'status'],
    })

    expect(query.match).toEqual({
      team: 'team1',
      status: 'active'
    })
  })

  it('applies multiple in combination with match', () => {
    const query = buildQueryFromParams({
      match: { team: { $in: ['team1', 'team2'] } },
      queryParams: { filters: { team: 'team1' } },
      searchableFields: [],
      sortableFields: [],
      filterableFields: ['team'],
    })

    expect(query.match).toEqual({
      $and: [
        { team: { $in: ['team1', 'team2'] } },
        { team: 'team1' }
      ]
    })
  })

  it('applies search and filters in combination with match', () => {
    const query = buildQueryFromParams({
      match: { team: { $in: ['team1', 'team2'] } },
      queryParams: { searchValue: 'foo', filters: { team: 'team1' } },
      searchableFields: ['name'],
      sortableFields: ['name'],
      filterableFields: ['team'],
    })

    expect(query.match).toEqual({
      $and: [
        { team: { $in: ['team1', 'team2'] } },
        { team: 'team1' }
      ],
      name: { $regex: /foo/i }
    })
  })

  it('ignores filters that are not listed in filterableFields', () => {
    const query = buildQueryFromParams({
      match: {},
      queryParams: { filters: { foo: 'x' } },
      searchableFields: [],
      sortableFields: ['name'],
      filterableFields: ['team'],
    })
    expect(query.match).toEqual({})
  })

  it('throws when filters provided but no filterableFields configured', () => {
    expect(() =>
      buildQueryFromParams({
        match: {},
        queryParams: { filters: { team: 'team1' } },
        searchableFields: [],
        sortableFields: ['name'],
        // no filterableFields
      } as any)
    ).toThrow()
  })

  it('validates sort field and allows dashed sort values', () => {
    const query = buildQueryFromParams({
      match: {},
      queryParams: { sort: '-name' },
      searchableFields: [],
      sortableFields: ['name'],
    })

    expect(query.sort).toBe('-name')

    expect(() =>
      buildQueryFromParams({
        match: {},
        queryParams: { sort: 'invalid' },
        searchableFields: [],
        sortableFields: ['name'],
      })
    ).toThrow(/Invalid sort field/)
  })

  it('returns empty sort object when no sort specified', () => {
    const query = buildQueryFromParams({
      match: {},
      queryParams: {},
      searchableFields: [],
      sortableFields: ['name'],
    })
    expect(query.sort).toEqual(null)
  })

  it('throws when sort provided but no sortableFields configured', () => {
    expect(() =>
      buildQueryFromParams({
        match: {},
        queryParams: { sort: 'name' },
        searchableFields: [],
        // sortableFields omitted
      } as any)
    ).toThrow()
  })

  it('preserves page parameter', () => {
    const query = buildQueryFromParams({
      match: {},
      queryParams: { currentPage: '2' },
      searchableFields: [],
      sortableFields: ['name'],
    })

    expect(query.page).toBe('2')
  })

  it('page is undefined when not provided', () => {
    const query = buildQueryFromParams({
      match: {},
      queryParams: {},
      searchableFields: [],
      sortableFields: ['name'],
    })
    expect(query.page).toBeUndefined()
  })
})
