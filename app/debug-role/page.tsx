"use client"

import { useState, useEffect } from "react"
import { checkCurrentUserRole, fixAdminRole } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugRolePage() {
    const [userInfo, setUserInfo] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [fixing, setFixing] = useState(false)
    const [message, setMessage] = useState("")

    useEffect(() => {
        loadUserInfo()
    }, [])

    const loadUserInfo = async () => {
        setLoading(true)
        const result = await checkCurrentUserRole()
        setUserInfo(result)
        setLoading(false)
    }

    const handleFixRole = async () => {
        if (!userInfo?.user) return

        setFixing(true)
        setMessage("")

        const result = await fixAdminRole(userInfo.user.id, userInfo.user.email)

        if (result.error) {
            setMessage(`Error: ${result.error}`)
        } else {
            setMessage(`✅ ${result.message}`)
            // Reload user info
            await loadUserInfo()
        }

        setFixing(false)
    }

    if (loading) {
        return <div className="container mx-auto py-8">Loading...</div>
    }

    if (userInfo?.error) {
        return (
            <div className="container mx-auto py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-500">{userInfo.error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const profile = userInfo?.user?.profile

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Debug User Role</CardTitle>
                    <CardDescription>Check and fix your user role configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">User Information:</h3>
                        <div className="bg-muted p-4 rounded-md space-y-2">
                            <p><strong>User ID:</strong> {userInfo?.user?.id}</p>
                            <p><strong>Email:</strong> {userInfo?.user?.email}</p>
                            <p><strong>Full Name:</strong> {profile?.full_name || "N/A"}</p>
                            <p><strong>Role ID:</strong> {profile?.role_id || "❌ NOT SET"}</p>
                            <p><strong>Role Name:</strong> {profile?.roles?.role_name || "❌ NOT SET"}</p>
                        </div>
                    </div>

                    {!profile?.role_id && (
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                            <p className="text-yellow-800 mb-4">
                                ⚠️ Your profile doesn't have a role_id set. This is why you can't access admin pages.
                            </p>
                            <Button onClick={handleFixRole} disabled={fixing}>
                                {fixing ? "Fixing..." : "Fix: Set as Admin"}
                            </Button>
                        </div>
                    )}

                    {profile?.roles?.role_name && (
                        <div className={`p-4 rounded-md ${profile.roles.role_name === "admin"
                                ? "bg-green-50 border border-green-200"
                                : "bg-blue-50 border border-blue-200"
                            }`}>
                            <p className={profile.roles.role_name === "admin" ? "text-green-800" : "text-blue-800"}>
                                ✅ Your role is set to: <strong>{profile.roles.role_name}</strong>
                            </p>
                        </div>
                    )}

                    {message && (
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                            <p>{message}</p>
                        </div>
                    )}

                    <div className="pt-4">
                        <Button variant="outline" onClick={loadUserInfo}>
                            Refresh Info
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
