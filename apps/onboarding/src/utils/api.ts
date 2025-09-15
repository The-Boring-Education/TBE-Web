import { APIResponse, User } from "../types/onboarding"
import { getProductConfig } from "../config/products"

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Simple API functions
export async function getUserById(
  userId: string,
  token?: string
): Promise<User | null> {
  try {
    const url = `${VITE_API_BASE_URL}/user?userId=${userId}`
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    const data: APIResponse<User> = await response.json()
    return data.status && data.data ? data.data : null
  } catch {
    return null
  }
}

export async function checkUsernameAvailable(
  username: string,
  token?: string
): Promise<boolean> {
  try {
    const url = `${VITE_API_BASE_URL}/user/onboarding?userName=${username}`

    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    const data: APIResponse = await response.json()
    return data.status
  } catch {
    return false
  }
}

export async function submitOnboarding(
  productId: string,
  userId: string,
  data: unknown,
  token?: string,
  from?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getProductConfig(productId)
    if (!config) {
      return { success: false, error: "Invalid product configuration" }
    }

    const payload = config.api.transformPayload(data, userId, from)
    // Handle dynamic endpoint
    const endpoint =
            typeof config.api.endpoint === "function"
              ? config.api.endpoint(userId)
              : config.api.endpoint
    const response = await fetch(endpoint, {
      method: config.api.method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    })

    const result: APIResponse = await response.json()
    return {
      success: result.status,
      error: result.error || result.message
    }
  } catch (error: any) {
    return { success: false, error: error?.message || "Network error" }
  }
}
