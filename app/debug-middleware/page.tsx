"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugMiddlewarePage() {
    const [logs, setLogs] = useState<string[]>([])

    const testAdminAccess = async () => {
        setLogs(["Testing admin access..."])

        try {
            // Try to fetch an admin page
            const response = await fetch("/admin/admin-users", {
                method: "GET",
                redirect: "manual"
            })

            setLogs(prev => [...prev, `Response status: ${response.status}`])
            setLogs(prev => [...prev, `Response type: ${response.type}`])

            if (response.redirected) {
                setLogs(prev => [...prev, `❌ Redirected to: ${response.url}`])
            } else {
                setLogs(prev => [...prev, `✅ No redirect, access granted`])
            }
        } catch (error) {
            setLogs(prev => [...prev, `Error: ${error}`])
        }
    }

    const clearCookies = () => {
        setLogs(["Clearing cookies and reloading..."])
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
        })
        setTimeout(() => {
            window.location.href = "/auth/login"
        }, 1000)
    }

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Debug Middleware</CardTitle>
                    <CardDescription>Test admin access and middleware behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Button onClick={testAdminAccess}>Test Admin Access</Button>
                        <Button variant="outline" onClick={clearCookies}>Clear Cookies & Re-login</Button>
                        <Button variant="outline" onClick={() => window.location.href = "/admin"}>
                            Go to /admin
                        </Button>
                    </div>

                    {logs.length > 0 && (
                        <div className="bg-muted p-4 rounded-md">
                            <h3 className="font-semibold mb-2">Logs:</h3>
                            <div className="space-y-1 font-mono text-sm">
                                {logs.map((log, i) => (
                                    <div key={i}>{log}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                        <h3 className="font-semibold mb-2">Quick Fix:</h3>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>Click "Clear Cookies & Re-login"</li>
                            <li>Log in again with your admin account</li>
                            <li>Try accessing /admin again</li>
                        </ol>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
