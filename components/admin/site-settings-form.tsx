"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { updateSiteSettings } from "@/app/admin/settings/actions"

interface Setting {
  id: string
  setting_key: string
  setting_value: string | null
  setting_type: string
  description: string | null
}

export function SiteSettingsForm({ settings }: { settings: Setting[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const getSettingValue = (key: string) => {
    return settings.find((s) => s.setting_key === key)?.setting_value || ""
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateSiteSettings(formData)

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Site settings updated successfully",
      })
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="smtp_server">SMTP Server *</Label>
          <Input
            id="smtp_server"
            name="smtp_server"
            defaultValue={getSettingValue("smtp_server")}
            placeholder="smtp.gmail.com"
            required
          />
        </div>

        <div>
          <Label htmlFor="smtp_email">SMTP Email *</Label>
          <Input
            id="smtp_email"
            name="smtp_email"
            type="email"
            defaultValue={getSettingValue("smtp_email")}
            placeholder="noreply@example.com"
            required
          />
        </div>

        <div>
          <Label htmlFor="smtp_password">SMTP Password *</Label>
          <Input
            id="smtp_password"
            name="smtp_password"
            type="password"
            defaultValue={getSettingValue("smtp_password")}
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch id="smtp_ssl" name="smtp_ssl" defaultChecked={getSettingValue("smtp_ssl") === "true"} />
          <Label htmlFor="smtp_ssl">Use SSL</Label>
        </div>

        <div>
          <Label htmlFor="site_url">Site URL</Label>
          <Input
            id="site_url"
            name="site_url"
            type="url"
            defaultValue={getSettingValue("site_url")}
            placeholder="https://example.com"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  )
}
