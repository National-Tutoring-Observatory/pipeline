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

export default (
  collection: Document[],
  match: Match
): Document[] => {


  return filter(collection, (item: Document) => {
    return every(match, (condition, key) => {

      if (!key.includes('.')) {
        const itemValue = get(item, key);
        if (isObject(condition) && has(condition, '$ne')) {
          return itemValue !== condition.$ne;
        }
        if (has(condition, '$in')) {
          if (!isArray(condition.$in)) return false;

          // If itemValue is an array, check if any element in itemValue is in condition.$in
          if (isArray(itemValue)) {
            return some(itemValue, (val) => includes(condition.$in, val));
          }

          // If itemValue is scalar, check if itemValue is in condition.$in
          return includes(condition.$in, itemValue);
        }
        return itemValue === condition;
      }

      const [arrayPath, nestedKey] = key.split('.');
      const nestedArray = get(item, arrayPath);

      if (!isArray(nestedArray)) return false;

      if (isObject(condition) && has(condition, '$ne')) {
        return !some(nestedArray, { [nestedKey]: condition.$ne });
      }

      if (has(condition, '$in')) {
        const inArray = condition.$in;
        if (!isArray(inArray)) return false;
        return some(nestedArray, (nestedItem) => {
          return includes(inArray, get(nestedItem, nestedKey));
        });
      }

      return some(nestedArray, { [nestedKey]: condition });
    });
  });


}
