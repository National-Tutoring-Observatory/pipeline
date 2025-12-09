import { describe, expect, it } from 'vitest'
import buildQueryFromParams from '../buildQueryFromParams'

describe('buildQueryFromParams', () => {
  it('builds a single-field regex match when one searchable field is provided', () => {
    const query = buildQueryFromParams({
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
        queryParams: { searchValue: 'x' },
        // explicitly no searchable fields
        searchableFields: [],
        sortableFields: ['name'],
      })
    ).toThrow()
  })

  it('applies filters and respects allowed filterableValues', () => {
    const query = buildQueryFromParams({
      queryParams: { filters: { team: 'team1' } },
      searchableFields: [],
      sortableFields: ['name'],
      filterableFields: ['team'],
      filterableValues: { team: ['team1', 'team2'] },
    })

    expect(query.match).toEqual({
      team: { $in: ['team1'] }
    })
  })

  it('applies multiple filters correctly', () => {
    const query = buildQueryFromParams({
      queryParams: { filters: { team: 'team1', status: 'active' } },
      searchableFields: [],
      sortableFields: ['name'],
      filterableFields: ['team', 'status'],
    })

    expect(query.match.$and).toEqual([
      { team: { $in: ['team1'] } },
      { status: { $in: ['active'] } },
    ])
  })

  it('throws when filter value is not allowed', () => {
    expect(() =>
      buildQueryFromParams({
        queryParams: { filters: { team: 'bad' } },
        searchableFields: [],
        sortableFields: ['name'],
        filterableFields: ['team'],
        filterableValues: { team: ['team1', 'team2'] },
      })
    ).toThrow(/Access to the specified team is not allowed/)
  })

  it('throws when filter value is not a string', () => {
    expect(() =>
      // force a non-string value at runtime
      buildQueryFromParams({
        // @ts-expect-error test invalid runtime value
        queryParams: { filters: { team: 123 } },
        searchableFields: [],
        sortableFields: ['name'],
        filterableFields: ['team'],
      })
    ).toThrow(/Filter value for team must be a string/)
  })

  it('ignores filters that are not listed in filterableFields', () => {
    const query = buildQueryFromParams({
      queryParams: { filters: { foo: 'x' } },
      searchableFields: [],
      sortableFields: ['name'],
      filterableFields: ['team'],
    })
    // no matching filterable field -> match should remain empty
    expect(query.match).toEqual({})
  })

  it('throws when filters provided but no filterableFields configured', () => {
    expect(() =>
      buildQueryFromParams({
        queryParams: { filters: { team: 'team1' } },
        searchableFields: [],
        sortableFields: ['name'],
        // no filterableFields
      } as any)
    ).toThrow()
  })

  it('validates sort field and allows dashed sort values', () => {
    const query = buildQueryFromParams({
      queryParams: { sort: '-name' },
      searchableFields: [],
      sortableFields: ['name'],
    })

    expect(query.sort).toBe('-name')

    expect(() =>
      buildQueryFromParams({
        queryParams: { sort: 'invalid' },
        searchableFields: [],
        sortableFields: ['name'],
      })
    ).toThrow(/Invalid sort field/)
  })

  it('returns empty sort object when no sort specified', () => {
    const query = buildQueryFromParams({
      queryParams: {},
      searchableFields: [],
      sortableFields: ['name'],
    })
    expect(query.sort).toEqual({})
  })

  it('throws when sort provided but no sortableFields configured', () => {
    expect(() =>
      buildQueryFromParams({
        queryParams: { sort: 'name' },
        searchableFields: [],
        // sortableFields omitted
      } as any)
    ).toThrow()
  })

  it('preserves page parameter', () => {
    const query = buildQueryFromParams({
      queryParams: { page: '2' },
      searchableFields: [],
      sortableFields: ['name'],
    })

    expect(query.page).toBe('2')
  })

  it('page is undefined when not provided', () => {
    const query = buildQueryFromParams({
      queryParams: {},
      searchableFields: [],
      sortableFields: ['name'],
    })
    expect(query.page).toBeUndefined()
  })
})
