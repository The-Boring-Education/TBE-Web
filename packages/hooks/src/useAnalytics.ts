/**
 * @deprecated Use `useTracking` instead. This hook is kept for backward
 * compatibility and re-exports the same functionality.
 */
import useTracking from "./useTracking";

const useAnalytics = () => useTracking();

export default useAnalytics;
