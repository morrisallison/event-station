import type { MatchingListener } from "../types/MatchingListener";
import { matchListener } from "./matchListener";

export function matchListeners<EVT>(
  matchingListener: MatchingListener<EVT>,
  attachedListeners: MatchingListener<EVT>[],
  exactMatch?: boolean
): boolean {
  const count = attachedListeners.length;

  if (count < 1) return false;

  for (const attachedListener of attachedListeners) {
    if (matchListener(matchingListener, attachedListener, exactMatch)) {
      return true;
    }
  }

  return false;
}
