"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, Share2, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UpiQRCodeProps {
  upiId: string
  name: string
  amount?: number
}

export function UpiQRCode({ upiId, name, amount }: UpiQRCodeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Generate UPI payment string
  const generateUpiString = () => {
    let upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}`
    if (amount && amount > 0) {
      upiString += `&am=${amount}`
    }
    return upiString
  }

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied!",
      description: "UPI ID copied to clipboard",
    })
  }

  const handleDownloadQR = () => {
    const svg = document.getElementById("upi-qr-code")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL("image/png")

      const downloadLink = document.createElement("a")
      downloadLink.download = `${name.replace(/\s+/g, "_")}_UPI_QR.png`
      downloadLink.href = pngFile
      downloadLink.click()

      toast({
        title: "Downloaded!",
        description: "QR code saved to your device",
      })
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  const handleShare = async () => {
    const upiString = generateUpiString()
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pay ${name}`,
          text: `UPI ID: ${upiId}`,
          url: upiString,
        })
      } catch (error) {
        // User cancelled or share failed
        handleCopyUpiId()
      }
    } else {
      handleCopyUpiId()
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Share2 className="h-4 w-4" />
        Share QR
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>UPI QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to pay {name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* QR Code */}
            <div className="flex justify-center p-6 bg-white rounded-lg">
              <QRCodeSVG
                id="upi-qr-code"
                value={generateUpiString()}
                size={256}
                level="H"
                includeMargin
              />
            </div>

            {/* UPI ID */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">UPI ID</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm">
                  {upiId}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyUpiId}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {amount && amount > 0 && (
              <div className="p-3 bg-primary/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold">₹{amount.toFixed(2)}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleDownloadQR}
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Anyone can scan this QR code to pay you via UPI
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
