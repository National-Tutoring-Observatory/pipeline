import every from 'lodash/every';
import filter from 'lodash/filter';
import get from 'lodash/get';
import has from 'lodash/has';
import includes from 'lodash/includes';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import some from 'lodash/some';

interface Match {
  [key: string]: any;
}

interface Document {
  [key: string]: any;
}

function matchesCondition(itemValue: any, condition: any): boolean {
  // $ne
  if (has(condition, '$ne')) {
    const val = condition.$ne;
    if (isArray(itemValue)) {
      return !some(itemValue, (v) => v === val);
    }
    return itemValue !== val;
  }

  // $regex
  if (isObject(condition) && has(condition, '$regex')) {
    const cond: any = condition;
    const regexVal: any = cond.$regex;
    const options: string = cond.$options || '';
    let re: RegExp | null = null;
    try {
      if (regexVal instanceof RegExp) {
        re = regexVal;
      } else if (typeof regexVal === 'string') {
        re = new RegExp(regexVal, options);
      }
    } catch (err) {
      return false;
    }

    if (!re) return false;

    if (isArray(itemValue)) {
      return some(itemValue, (val) => re!.test(val));
    }

    return re.test(itemValue);
  }

  // $in
  if (has(condition, '$in')) {
    const cond: any = condition;
    const inArray = cond.$in;
    if (!isArray(inArray)) return false;

    if (isArray(itemValue)) {
      return some(itemValue, (v) => includes(inArray, v));
    }

    return includes(inArray, itemValue);
  }

  // default equality (handle arrays)
  if (isArray(itemValue)) {
    return some(itemValue, (v) => v === condition);
  }
  return itemValue === condition;
}

export default (
  collection: Document[],
  match: Match
): Document[] => {


  return filter(collection, (item: Document) => {
    return every(match, (condition, key) => {

      if (!key.includes('.')) {
        const itemValue = get(item, key);
        return matchesCondition(itemValue, condition);
      }

      const [arrayPath, nestedKey] = key.split('.');
      const nestedArray = get(item, arrayPath);

      if (!isArray(nestedArray)) return false;

      if (isObject(condition) && has(condition, '$ne')) {
        // For nested $ne, original behavior: document matches if NONE of the nested items equal the $ne value
        return !some(nestedArray, (nestedItem) => get(nestedItem, nestedKey) === condition.$ne);
      }

      // For other conditions, match if any nested item satisfies the condition
      return some(nestedArray, (nestedItem) => matchesCondition(get(nestedItem, nestedKey), condition));
    });
  });


}
