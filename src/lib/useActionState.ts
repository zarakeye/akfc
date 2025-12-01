// exemple minimaliste
import { useState, useCallback } from "react";

/**
 * Hook that manages the state and action of a promise-based action.
 *
 * The hook returns an array with two elements. The first element is the state
 * of the action, which has a `pending` property that is `true` while the
 * action is pending and `false` when it is resolved, and a `result`
 * property that is `null` while the action is pending and the result of the action
 * when it is resolved. The second element is a callback function that calls the
 * action and updates the state accordingly.
 *
 * @template Payload, Result
 * @param {function(Payload): Promise<Result>} action - the action to manage
 * @param {{ pending: boolean; result: Result | null }} initialState - the initial state
 * @returns {readonly [state: { pending: boolean; result: Result | null }, formAction: (payload: Payload) => Promise<Result>]}
 */
export function useActionState<Payload, Result>(
  action: (payload: Payload) => Promise<Result>,
  initialState: { pending: boolean; result: Result | null }
): [state: { pending: boolean; result: Result | null }, formAction: (payload: Payload) => Promise<Result>] {
  const [state, setState] = useState(initialState);

  const formAction = useCallback(
    async (payload: Payload) => {
      setState({ ...state, pending: true });
      const result = await action(payload);
      setState({ pending: false, result });
      return result;
    },
    [action, state]
  );

  return [state, formAction] as const;
}
