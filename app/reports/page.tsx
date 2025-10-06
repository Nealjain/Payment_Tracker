"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BurgerMenu } from "@/components/burger-menu"
import { useToast } from "@/hooks/use-toast"
import { Download, FileText, Calendar, TrendingUp } from "lucide-react"
import SharedBackground from "@/components/ui/shared-background"
import { generatePDFReport, downloadPDF } from "@/lib/pdf-report"

export default function ReportsPage() {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = async (period: "monthly" | "yearly") => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      })

      const result = await response.json()

      if (result.success) {
        // Generate PDF
        const pdf = generatePDFReport(result.data)
        const filename = `${period}_report_${new Date().toISOString().split("T")[0]}.pdf`
        downloadPDF(pdf, filename)

        toast({
          title: "Report Generated",
          description: `Your ${period} report has been downloaded`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate report",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      <SharedBackground />
      <BurgerMenu />

      <div className="p-4 pt-20 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Financial Reports</h1>
            <p className="text-muted-foreground">Generate and download detailed reports</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Monthly Report</CardTitle>
                    <CardDescription>Current month summary</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Income & Expense Summary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>Category Breakdown</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Transaction History</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Group Expenses</span>
                  </div>
                </div>
                <Button
                  onClick={() => handleGenerateReport("monthly")}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download Monthly Report
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Yearly Report</CardTitle>
                    <CardDescription>Current year summary</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Annual Income & Expenses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>Yearly Trends</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>All Transactions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Group Activity</span>
                  </div>
                </div>
                <Button
                  onClick={() => handleGenerateReport("yearly")}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download Yearly Report
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Report Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Included in Reports:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Total income and expenses</li>
                    <li>• Net balance and savings rate</li>
                    <li>• Category-wise breakdown</li>
                    <li>• Detailed transaction list</li>
                    <li>• Group expense summary</li>
                    <li>• Visual charts and graphs</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Automatic Notifications:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Monthly report on 1st of each month</li>
                    <li>• Yearly report on January 1st</li>
                    <li>• Notification when report is ready</li>
                    <li>• Download anytime from here</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
