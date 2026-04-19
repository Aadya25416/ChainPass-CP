import { useState, useCallback } from 'react'

const STORAGE_KEY = 'chainpass:reviews_v1'

// ─── Persistence helpers ──────────────────────────────────────────────────────

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveAll(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    console.warn('[useReviews] localStorage write failed')
  }
}

/**
 * Manages frontend-only reviews for a specific event.
 * Stored in localStorage under STORAGE_KEY.
 *
 * Schema: { [eventId: string]: Review[] }
 * Review: { wallet: string, rating: 1-5, comment: string, timestamp: number }
 *
 * Constraints enforced:
 * - One review per (eventId, wallet) pair — resubmit overwrites the previous one
 */
export function useReviews(eventId) {
  const key = String(eventId)

  const [reviews, setReviews] = useState(() => {
    return loadAll()[key] ?? []
  })

  const submitReview = useCallback(
    ({ wallet, rating, comment }) => {
      if (!wallet || !rating || !comment?.trim()) return

      const review = {
        wallet: wallet.toLowerCase(),
        rating: Number(rating),
        comment: comment.trim(),
        timestamp: Date.now(),
      }

      const all = loadAll()
      // Remove any prior review from the same wallet for this event
      const prior = (all[key] ?? []).filter(
        (r) => r.wallet !== review.wallet,
      )
      const updated = [...prior, review]

      all[key] = updated
      saveAll(all)
      setReviews(updated)
    },
    [key],
  )

  const hasReviewed = useCallback(
    (wallet) => {
      if (!wallet) return false
      return reviews.some((r) => r.wallet === wallet.toLowerCase())
    },
    [reviews],
  )

  /** Average rating, or 0 if no reviews */
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0

  return { reviews, submitReview, hasReviewed, avgRating }
}
