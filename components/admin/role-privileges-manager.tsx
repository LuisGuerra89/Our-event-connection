"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Privilege {
  id: string
  privilege_name: string
  module_name: string
  description: string | null
}

export function RolePrivilegesManager({
  roleId,
  allPrivileges,
  assignedPrivilegeIds,
}: {
  roleId: string
  allPrivileges: Privilege[]
  assignedPrivilegeIds: string[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPrivileges, setSelectedPrivileges] = useState<string[]>(assignedPrivilegeIds)

  // Group privileges by module
  const groupedPrivileges = allPrivileges.reduce(
    (acc, privilege) => {
      if (!acc[privilege.module_name]) {
        acc[privilege.module_name] = []
      }
      acc[privilege.module_name].push(privilege)
      return acc
    },
    {} as Record<string, Privilege[]>,
  )

  const handleTogglePrivilege = (privilegeId: string) => {
    setSelectedPrivileges((prev) =>
      prev.includes(privilegeId) ? prev.filter((id) => id !== privilegeId) : [...prev, privilegeId],
    )
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/role-privileges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId,
          privilegeIds: selectedPrivileges,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update privileges")
      }

      toast({
        title: "Success",
        description: "Role privileges updated successfully",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update privileges",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedPrivileges).map(([moduleName, privileges]) => (
        <div key={moduleName} className="space-y-3">
          <h3 className="text-lg font-semibold">{moduleName}</h3>
          <div className="space-y-2 pl-4">
            {privileges.map((privilege) => (
              <div key={privilege.id} className="flex items-start space-x-3">
                <Checkbox
                  id={privilege.id}
                  checked={selectedPrivileges.includes(privilege.id)}
                  onCheckedChange={() => handleTogglePrivilege(privilege.id)}
                />
                <div className="flex-1">
                  <Label htmlFor={privilege.id} className="cursor-pointer font-normal">
                    {privilege.privilege_name}
                  </Label>
                  {privilege.description && <p className="text-sm text-muted-foreground">{privilege.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-4 pt-4">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Privileges"}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
