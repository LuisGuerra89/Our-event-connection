/**
 * Hook for validating event dates
 * Ensures date consistency and logical order
 */

interface DateValidationErrors {
  start_date?: string
  end_date?: string
  registration_start_date?: string
  registration_end_date?: string
}

interface EventDates {
  start_date?: string | Date
  end_date?: string | Date
  registration_start_date?: string | Date
  registration_end_date?: string | Date
}

export function useEventDateValidation() {
  /**
   * Validates event dates
   * Rules:
   * 1. start_date must be in the future (optional, for editing past events)
   * 2. end_date must be after start_date
   * 3. registration_start_date must be before start_date
   * 4. registration_end_date must be after registration_start_date
   * 5. registration_end_date must be before or equal to start_date
   * 6. registration_start_date must be in the future or today
   */
  const validateDates = (dates: EventDates): DateValidationErrors => {
    const errors: DateValidationErrors = {}

    // Convert to Date objects if strings
    const startDate = dates.start_date ? new Date(dates.start_date) : null
    const endDate = dates.end_date ? new Date(dates.end_date) : null
    const regStartDate = dates.registration_start_date ? new Date(dates.registration_start_date) : null
    const regEndDate = dates.registration_end_date ? new Date(dates.registration_end_date) : null

    const now = new Date()
    now.setHours(0, 0, 0, 0) // Reset to start of day for date comparison

    // Rule 1: start_date must be provided and in the future
    if (!startDate) {
      errors.start_date = "Start date is required"
    } else if (startDate < now) {
      errors.start_date = "Start date must be in the future"
    }

    // Rule 2: end_date must be after start_date
    if (!endDate) {
      errors.end_date = "End date is required"
    } else if (startDate && endDate <= startDate) {
      errors.end_date = "End date must be after start date"
    }

    // Rule 3 & 4: Registration dates validation
    if (regStartDate && !regEndDate) {
      errors.registration_end_date = "End registration date is required when start registration date is set"
    }

    if (regEndDate && !regStartDate) {
      errors.registration_start_date = "Start registration date is required when end registration date is set"
    }

    // Rule 4: registration_end_date must be after registration_start_date
    if (regStartDate && regEndDate && regEndDate <= regStartDate) {
      errors.registration_end_date = "End registration date must be after start registration date"
    }

    // Rule 5: registration_start_date must be before start_date
    if (regStartDate && startDate && regStartDate >= startDate) {
      errors.registration_start_date = "Registration start date must be before event start date"
    }

    // Rule 6: registration_end_date must be before or equal to start_date
    if (regEndDate && startDate && regEndDate > startDate) {
      errors.registration_end_date = "Registration end date must be before or equal to event start date"
    }

    // Rule 7: registration_start_date must be in the future or today
    if (regStartDate && regStartDate < now) {
      errors.registration_start_date = "Registration start date must be in the future or today"
    }

    return errors
  }

  /**
   * Validates a single date field
   * Useful for real-time validation as user types
   */
  const validateSingleField = (
    fieldName: keyof EventDates,
    value: string | Date | undefined,
    otherDates: Partial<EventDates>
  ): string | undefined => {
    const allDates = { ...otherDates, [fieldName]: value }
    const errors = validateDates(allDates)
    return errors[fieldName]
  }

  /**
   * Get validation helper for a specific field
   * Returns a function that can be used in form validation
   */
  const getFieldValidator = (fieldName: keyof EventDates) => {
    return (value: string | Date | undefined, otherDates: Partial<EventDates>) => {
      return validateSingleField(fieldName, value, otherDates)
    }
  }

  /**
   * Check if a date is valid (is a valid Date object)
   */
  const isValidDate = (date: any): boolean => {
    if (!date) return false
    const dateObj = new Date(date)
    return dateObj instanceof Date && !isNaN(dateObj.getTime())
  }

  /**
   * Format date for HTML input (datetime-local)
   */
  const formatDateForInput = (date: string | Date | null | undefined): string => {
    if (!date) return ""
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return ""

    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, "0")
    const day = String(dateObj.getDate()).padStart(2, "0")
    const hours = String(dateObj.getHours()).padStart(2, "0")
    const minutes = String(dateObj.getMinutes()).padStart(2, "0")

    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  return {
    validateDates,
    validateSingleField,
    getFieldValidator,
    isValidDate,
    formatDateForInput,
  }
}
