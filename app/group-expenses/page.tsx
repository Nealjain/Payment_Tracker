"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BurgerMenu } from "@/components/burger-menu"
import { Construction, Users, DollarSign, Split, ArrowRight } from "lucide-react"
import SimpleBackground from "@/components/ui/simple-background"
import { useRouter } from "next/navigation"

export default function GroupExpensesPage() {
  const router = useRouter()

  const upcomingFeatures = [
    {
      icon: Users,
      title: "Create Groups",
      description: "Form expense groups with friends, family, or roommates",
    },
    {
      icon: DollarSign,
      title: "Split Bills",
      description: "Easily divide expenses among group members",
    },
    {
      icon: Split,
      title: "Smart Splitting",
      description: "Split by percentage, equal parts, or custom amounts",
    },
    {
      icon: ArrowRight,
      title: "Settlement Tracking",
      description: "Track who owes whom and settle up easily",
    },
  ]

  return (
    <div className="min-h-screen bg-black relative">
      <SimpleBackground />

      <BurgerMenu />

      <div className="p-4 pt-20 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-yellow-500/10 rounded-full border-2 border-yellow-500/20 animate-pulse">
                <Construction className="h-16 w-16 text-yellow-500" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">Group Expenses</h1>
            <p className="text-xl text-muted-foreground">Coming Soon</p>
          </div>

          {/* Under Development Card */}
          <Card className="bg-card/95 backdrop-blur-lg border-0 border-yellow-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-500">
                <Construction className="h-5 w-5" />
                Under Development
              </CardTitle>
              <CardDescription>
                We're working hard to bring you an amazing group expense management experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Group Expenses will allow you to split bills and track shared expenses with friends, family, or
                  roommates. This feature is currently in development and will be available soon.
                </p>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-2">What to expect:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Create and manage expense groups</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Split bills equally or by custom amounts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Track who owes whom in real-time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Settle up with integrated payment tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>View group expense history and analytics</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingFeatures.map((feature, index) => (
              <Card
                key={index}
                className="bg-card/80 backdrop-blur-sm border-0 hover:bg-card/90 transition-all duration-200"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <feature.icon className="h-5 w-5 text-primary" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-lg border-0 border-primary/20">
            <CardContent className="p-6 text-center space-y-4">
              <h3 className="text-xl font-semibold">Want to be notified when it's ready?</h3>
              <p className="text-muted-foreground">
                We'll let you know as soon as Group Expenses is available. In the meantime, you can continue managing
                your personal expenses.
              </p>
              <Button onClick={() => router.push("/dashboard")} size="lg">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-card/95 backdrop-blur-lg border-0">
            <CardHeader>
              <CardTitle>Development Timeline</CardTitle>
              <CardDescription>Our planned rollout for Group Expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="w-0.5 h-full bg-muted"></div>
                  </div>
                  <div className="pb-8">
                    <h4 className="font-semibold text-green-500">Phase 1: Planning ✓</h4>
                    <p className="text-sm text-muted-foreground">Feature design and architecture</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
                    <div className="w-0.5 h-full bg-muted"></div>
                  </div>
                  <div className="pb-8">
                    <h4 className="font-semibold text-yellow-500">Phase 2: Development 🚧</h4>
                    <p className="text-sm text-muted-foreground">Building core functionality</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-muted"></div>
                    <div className="w-0.5 h-full bg-muted"></div>
                  </div>
                  <div className="pb-8">
                    <h4 className="font-semibold text-muted-foreground">Phase 3: Testing</h4>
                    <p className="text-sm text-muted-foreground">Beta testing with select users</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-muted"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-muted-foreground">Phase 4: Launch</h4>
                    <p className="text-sm text-muted-foreground">Public release to all users</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
