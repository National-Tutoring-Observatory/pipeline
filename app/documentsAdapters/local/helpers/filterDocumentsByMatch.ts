import filter from 'lodash/filter';
import every from 'lodash/every';
import some from 'lodash/some';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import has from 'lodash/has';
import isObject from 'lodash/isObject';

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
      // --- Simple path (e.g., "_id") ---
      if (!key.includes('.')) {
        const itemValue = get(item, key);
        // NEW: Check for the $ne operator
        if (isObject(condition) && has(condition, '$ne')) {
          return itemValue !== condition.$ne;
        }
        return itemValue === condition; // Default to equality
      }

      // --- Nested path (e.g., "teams.team") ---
      const [arrayPath, nestedKey] = key.split('.');
      const nestedArray = get(item, arrayPath);

      if (!isArray(nestedArray)) return false;

      // NEW: Check for the $ne operator
      if (isObject(condition) && has(condition, '$ne')) {
        // Return true if NONE of the nested items match the forbidden value.
        // !_.some(...) is equivalent to _.none(...)
        return !some(nestedArray, { [nestedKey]: condition.$ne });
      }

      // Default to equality: return true if SOME nested item matches.
      return some(nestedArray, { [nestedKey]: condition });
    });
  });


}