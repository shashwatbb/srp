/**
 * Subtle haptic tap for supported environments (Android Chrome, some WebViews).
 * iOS Safari does not expose the Vibration API — fails silently.
 * Respects `prefers-reduced-motion: reduce`.
 */
export function gentleHaptic(): void {
  if (typeof window === 'undefined') return
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
      return
    }
    const v = navigator.vibrate
    if (typeof v !== 'function') return
    v.call(navigator, [12])
  } catch {
    /* unsupported or blocked */
  }
}

/**
 * Very light tick for SRP filter sheet left category rail (switching section).
 * Milder than {@link gentleHaptic}. iOS Safari has no Vibration API; no-op.
 */
export function filterCategoryRailHaptic(): void {
  if (typeof window === 'undefined') return
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
      return
    }
    const v = navigator.vibrate
    if (typeof v !== 'function') return
    v.call(navigator, [7])
  } catch {
    /* unsupported or blocked */
  }
}
