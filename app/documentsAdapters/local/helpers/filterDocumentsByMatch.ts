import filter from 'lodash/filter';
import every from 'lodash/every';
import isArray from 'lodash/isArray';
import some from 'lodash/some';
import get from 'lodash/get';

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

    return every(match, (value: any, key: string) => {

      if (!key.includes('.')) {
        return get(item, key) === value;
      }

      const [arrayPath, nestedKey] = key.split('.');
      const nestedArray = get(item, arrayPath);

      return isArray(nestedArray) && some(nestedArray, { [nestedKey]: value });
    });
  });
}