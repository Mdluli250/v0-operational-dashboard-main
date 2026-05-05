'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">
            KPI Dashboard
          </CardTitle>
          <CardDescription>
            Sign in with your organization account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Access the operational KPI dashboard to view real-time performance metrics and tracking.
            </p>
          </div>
          <Button
            onClick={() => signIn('azure-ad', { callbackUrl: '/' })}
            className="w-full"
            size="lg"
          >
            Sign in with Azure AD
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            You will be redirected to your organization's Azure AD login
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
