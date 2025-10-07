import { headers } from "next/headers"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function CompleteProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
