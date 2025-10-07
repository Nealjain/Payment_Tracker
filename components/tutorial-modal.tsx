"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

const STORAGE_KEY = "pt_tutorial_seen_v1"

export default function TutorialModal() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const slides = [
    {
      title: "Welcome to PayDhan",
      desc: "Manage your expenses, track income, and collaborate with groups.",
    },
    {
      title: "Add Payments",
      desc: "Use the Add Payment button to quickly record income or expenses.",
    },
    {
      title: "Groups",
      desc: "Create groups to split bills and track shared expenses with friends.",
    },
    {
      title: "Reports",
      desc: "Generate reports to see your spending patterns and summaries.",
    },
  ]

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY)
      if (!seen) setOpen(true)
    } catch (e) {
      // ignore storage errors and show modal
      setOpen(true)
    }
  }, [])

  const close = (persist = true) => {
    setOpen(false)
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, "1")
      } catch (e) {
        // ignore
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) close(false); setOpen(val) }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{slides[step].title}</DialogTitle>
          <DialogDescription>{slides[step].desc}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mt-4">
          <div className="space-x-2">
            <Button size="sm" variant="ghost" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
              Previous
            </Button>
            <Button size="sm" variant="ghost" disabled={step === slides.length - 1} onClick={() => setStep((s) => Math.min(slides.length - 1, s + 1))}>
              Next
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">{step + 1} / {slides.length}</div>
            <Button size="sm" onClick={() => close(true)}>Got it</Button>
            <Button size="sm" variant="outline" onClick={() => close(true)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
