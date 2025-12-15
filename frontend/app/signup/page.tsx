"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BookOpen, Mail, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

const features = [
  "AI-powered study assistant",
  "Smart document organization",
  "Auto-generated quizzes",
  "Personalized study plans",
]

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [accountCreated, setAccountCreated] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      // Mock signup - in real app this would call an API
      await new Promise((resolve) => setTimeout(resolve, 800))

      setAccountCreated(true)
      toast.success("Account created successfully!")

      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch {
      toast.error("Sign up failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  if (accountCreated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border bg-card text-center">
          <CardContent className="pt-8 pb-8 space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Account Created!</h2>
              <p className="text-muted-foreground">
                Your account has been successfully created. Redirecting you to the login page...
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <Button onClick={() => router.push("/login")} variant="outline" className="w-full">
              Go to Login Now
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div suppressHydrationWarning className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left side - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 p-12 flex-col justify-center">
        <div className="max-w-md mx-auto space-y-8">
          <div className="flex items-center gap-3">
            <BookOpen className="h-12 w-12 text-primary" />
            <span className="text-3xl font-bold text-foreground">Smart Study Hub</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Start your learning journey today</h1>
            <p className="text-lg text-muted-foreground">
              Join thousands of students who are already studying smarter with AI-powered tools.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              &quot;Smart Study Hub transformed how I prepare for exams. The AI assistant is like having a tutor
              available 24/7!&quot;
            </p>
            <p className="text-sm font-medium text-foreground mt-2">— Sarah K., Computer Science Student</p>
          </div>
        </div>
      </div>

      {/* Right side - Sign up form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-12">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="flex flex-col items-center space-y-2 lg:hidden">
            <div className="flex items-center gap-2">
              <BookOpen className="h-10 w-10 text-primary" />
              <span className="text-2xl font-bold text-foreground">Smart Study Hub</span>
            </div>
          </div>

          {/* Sign Up Card */}
          <Card className="border-border bg-card">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Create an account</CardTitle>
              <CardDescription>Enter your details to get started with Smart Study Hub</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 bg-secondary border-border"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 bg-secondary border-border"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 bg-secondary border-border"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-9 bg-secondary border-border"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create account
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-4">
                By creating an account, you agree to our{" "}
                <button className="text-primary hover:underline">Terms of Service</button> and{" "}
                <button className="text-primary hover:underline">Privacy Policy</button>
              </p>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
