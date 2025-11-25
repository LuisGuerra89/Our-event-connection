"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function CreateAdminUserForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    mobile: "",
    role: "admin",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    return usernameRegex.test(username)
  }

  const validatePassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return passwordRegex.test(password)
  }

  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/
    return nameRegex.test(name)
  }

  const validatePhone = (phone: string): boolean => {
    // Remove formatting and check if it's 10 digits
    const digitsOnly = phone.replace(/\D/g, "")
    return digitsOnly.length === 10
  }

  const formatPhoneNumber = (value: string): string => {
    const digitsOnly = value.replace(/\D/g, "")
    if (digitsOnly.length <= 3) return digitsOnly
    if (digitsOnly.length <= 6) return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`
  }

  const handleFieldChange = (field: string, value: string) => {
    let processedValue = value
    const newErrors = { ...errors }

    // Apply formatting and validation based on field
    switch (field) {
      case "username":
        processedValue = value.toLowerCase().replace(/[^a-z0-9_]/g, "")
        if (processedValue && !validateUsername(processedValue)) {
          newErrors.username = "Username must be 3-20 characters (letters, numbers, underscore)"
        } else {
          delete newErrors.username
        }
        break
      case "email":
        if (value && !validateEmail(value)) {
          newErrors.email = "Please enter a valid email address"
        } else {
          delete newErrors.email
        }
        break
      case "firstName":
      case "lastName":
        processedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
        if (field === "firstName" && processedValue && !validateName(processedValue)) {
          newErrors.firstName = "Name must be 2-50 letters only"
        } else if (field === "firstName") {
          delete newErrors.firstName
        }
        break
      case "mobile":
        processedValue = formatPhoneNumber(value)
        if (processedValue && !validatePhone(processedValue)) {
          newErrors.mobile = "Please enter a valid 10-digit phone number"
        } else {
          delete newErrors.mobile
        }
        break
      case "password":
        if (value && !validatePassword(value)) {
          newErrors.password = "Password must be 8+ characters with uppercase, lowercase, and number"
        } else {
          delete newErrors.password
        }
        // Check confirm password match
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match"
        } else {
          delete newErrors.confirmPassword
        }
        break
      case "confirmPassword":
        if (value && value !== formData.password) {
          newErrors.confirmPassword = "Passwords do not match"
        } else {
          delete newErrors.confirmPassword
        }
        break
    }

    setErrors(newErrors)
    setFormData({ ...formData, [field]: processedValue })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Final validation
    const validationErrors: Record<string, string> = {}

    if (!validateUsername(formData.username)) {
      validationErrors.username = "Invalid username format"
    }
    if (!validateEmail(formData.email)) {
      validationErrors.email = "Invalid email format"
    }
    if (!validateName(formData.firstName)) {
      validationErrors.firstName = "Invalid first name"
    }
    if (!validatePhone(formData.mobile)) {
      validationErrors.mobile = "Invalid phone number"
    }
    if (!validatePassword(formData.password)) {
      validationErrors.password = "Password does not meet requirements"
    }
    if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match"
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/admin/create-admin-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create admin user")
      }

      toast({
        title: "Success",
        description: "Admin user created successfully",
      })

      router.push("/admin/admin-users")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create admin user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            required
            value={formData.username}
            onChange={(e) => handleFieldChange("username", e.target.value)}
            placeholder="john_doe"
            maxLength={20}
            className={errors.username ? "border-red-500" : ""}
          />
          {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            placeholder="john@example.com"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            required
            value={formData.firstName}
            onChange={(e) => handleFieldChange("firstName", e.target.value)}
            placeholder="John"
            maxLength={50}
            className={errors.firstName ? "border-red-500" : ""}
          />
          {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleFieldChange("lastName", e.target.value)}
            placeholder="Doe"
            maxLength={50}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile *</Label>
          <Input
            id="mobile"
            type="tel"
            required
            value={formData.mobile}
            onChange={(e) => handleFieldChange("mobile", e.target.value)}
            placeholder="(555) 123-4567"
            maxLength={14}
            className={errors.mobile ? "border-red-500" : ""}
          />
          {errors.mobile && <p className="text-sm text-red-500">{errors.mobile}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="userRole">User Role *</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select user role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={formData.password}
            onChange={(e) => handleFieldChange("password", e.target.value)}
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <Input
            id="confirmPassword"
            type="password"
            required
            minLength={8}
            value={formData.confirmPassword}
            onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
            placeholder="Re-enter password"
            className={errors.confirmPassword ? "border-red-500" : ""}
          />
          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading || Object.keys(errors).length > 0}>
          {isLoading ? "Creating..." : "Create Admin User"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
