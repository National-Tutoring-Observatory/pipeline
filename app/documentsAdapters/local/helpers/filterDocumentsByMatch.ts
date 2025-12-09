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
  if (isObject(condition) && has(condition, '$ne')) {
    const val = condition.$ne;

    // If itemValue is an array, follow Mongo semantics:
    // - If val is an array: $ne matches when the arrays differ (order, length, elements)
    // - If val is a scalar: $ne matches when none of the array elements equal the scalar
    if (isArray(itemValue)) {
      if (isArray(val)) {
        const valArr: any[] = val as any[];
        if (itemValue.length !== valArr.length) return true;
        for (let i = 0; i < itemValue.length; i++) {
          if (itemValue[i] !== valArr[i]) return true;
        }
        return false;
      }
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

    if (itemValue == null) return false;

    if (isArray(itemValue)) {
      return some(itemValue, (val) => val != null && re!.test(String(val)));
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

function evaluateExpression(item: Document, expr: Match): boolean {
  return every(expr, (condition, key) => {
    if (key === '$or') {
      // nested $or inside expression: treat similarly (should be array of expressions)
      if (!isArray(condition)) return false;
      return some(condition, (subExpr) => isObject(subExpr) && evaluateExpression(item, subExpr));
    }

    if (key === '$and') {
      // nested $and inside expression: all sub-expressions must match
      if (!isArray(condition)) return false;
      return every(condition, (subExpr) => isObject(subExpr) && evaluateExpression(item, subExpr));
    }

    // If key is a simple field, evaluate directly
    if (!key.includes('.')) {
      return matchesCondition(get(item, key), condition);
    }

    // Otherwise, resolve nested path recursively (supports arbitrary depth)
    const pathSegments = key.split('.');

    function resolveAndMatch(current: any, segments: string[]): boolean {
      if (segments.length === 0) {
        return matchesCondition(current, condition);
      }
      const [head, ...rest] = segments;
      const next = get(current, head);

      if (isArray(next)) {
        // If condition is $ne, require ALL nested items to match the $ne (i.e., none equal)
        if (isObject(condition) && has(condition, '$ne')) {
          return every(next, (el) => resolveAndMatch(el, rest));
        }
        // Otherwise, succeed if ANY nested item matches
        return some(next, (el) => resolveAndMatch(el, rest));
      }

      return resolveAndMatch(next, rest);
    }

    return resolveAndMatch(item, pathSegments);
  });
}

export default (
  collection: Document[],
  match: Match
): Document[] => {


  return filter(collection, (item: Document) => {
    return evaluateExpression(item, match);
  });


}
