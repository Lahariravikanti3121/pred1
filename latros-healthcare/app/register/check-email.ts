import { fetchSignInMethodsForEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"

/**
 * Checks if an email is already in use
 * @param email The email to check
 * @returns A promise that resolves to a boolean indicating if the email is in use
 */
export async function isEmailInUse(email: string): Promise<boolean> {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email)
    return methods.length > 0
  } catch (error) {
    console.error("Error checking email:", error)
    return false // Return false on error to allow form submission
  }
}
