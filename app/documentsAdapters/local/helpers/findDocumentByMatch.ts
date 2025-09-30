import find from 'lodash/find';
import every from 'lodash/every';
import some from 'lodash/some';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import has from 'lodash/has';
import isObject from 'lodash/isObject';
import includes from 'lodash/includes';

interface Match {
  [key: string]: any;
}

interface Document {
  [key: string]: any;
}

export default (
  collection: Document[],
  match: Match
): Document | undefined => {


  return find(collection, (item: Document) => {
    return every(match, (condition, key) => {

      if (!key.includes('.')) {
        const itemValue = get(item, key);
        if (isObject(condition) && has(condition, '$ne')) {
          return itemValue !== condition.$ne;
        }
        if (has(condition, '$in')) {
          return isArray(condition.$in) && includes(condition.$in, itemValue);
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