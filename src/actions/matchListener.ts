import type { MatchingListener } from "../types/MatchingListener";

/**
 * Determines whether the given listeners match by performing an approximate match
 * using the `matchCallback`, `matchContext`, `hearer`, and `eventName` properties.
 * @param exactMatch - If true, an exact value match will be performed instead of an approximate match.
 */
export function matchListener(
  matchingListener: MatchingListener,
  attachedListener: MatchingListener,
  exactMatch?: boolean
): boolean {
  if (exactMatch === true) {
    return matchingListener === attachedListener;
  }

  const matchCallback = matchingListener.matchCallback;

  if (matchCallback && matchCallback !== attachedListener.matchCallback) {
    return false;
  }

  const matchContext = matchingListener.matchContext;

  if (
    matchContext !== undefined &&
    matchContext !== attachedListener.matchContext
  ) {
    return false;
  }

  const hearer = matchingListener.hearer;

  if (hearer && hearer !== attachedListener.hearer) {
    return false;
  }

  const eventName = matchingListener.eventName;

  if (eventName !== undefined && eventName !== attachedListener.eventName) {
    return false;
  }

  return true;
}
