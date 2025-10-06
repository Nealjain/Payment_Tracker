export function getCurrencyFromPhone(phoneNumber: string | null): {
  symbol: string
  code: string
  locale: string
} {
  if (!phoneNumber) {
    return { symbol: "₹", code: "INR", locale: "en-IN" }
  }

  // Extract country code
  const countryCode = phoneNumber.match(/^\+(\d{1,3})/)?.[1]

  switch (countryCode) {
    case "1": // USA, Canada
      return { symbol: "$", code: "USD", locale: "en-US" }
    case "44": // UK
      return { symbol: "£", code: "GBP", locale: "en-GB" }
    case "91": // India
      return { symbol: "₹", code: "INR", locale: "en-IN" }
    case "61": // Australia
      return { symbol: "A$", code: "AUD", locale: "en-AU" }
    case "81": // Japan
      return { symbol: "¥", code: "JPY", locale: "ja-JP" }
    case "86": // China
      return { symbol: "¥", code: "CNY", locale: "zh-CN" }
    case "49": // Germany
      return { symbol: "€", code: "EUR", locale: "de-DE" }
    case "33": // France
      return { symbol: "€", code: "EUR", locale: "fr-FR" }
    case "39": // Italy
      return { symbol: "€", code: "EUR", locale: "it-IT" }
    case "34": // Spain
      return { symbol: "€", code: "EUR", locale: "es-ES" }
    case "971": // UAE
      return { symbol: "د.إ", code: "AED", locale: "ar-AE" }
    case "966": // Saudi Arabia
      return { symbol: "﷼", code: "SAR", locale: "ar-SA" }
    case "65": // Singapore
      return { symbol: "S$", code: "SGD", locale: "en-SG" }
    case "60": // Malaysia
      return { symbol: "RM", code: "MYR", locale: "ms-MY" }
    case "62": // Indonesia
      return { symbol: "Rp", code: "IDR", locale: "id-ID" }
    case "66": // Thailand
      return { symbol: "฿", code: "THB", locale: "th-TH" }
    case "82": // South Korea
      return { symbol: "₩", code: "KRW", locale: "ko-KR" }
    case "55": // Brazil
      return { symbol: "R$", code: "BRL", locale: "pt-BR" }
    case "52": // Mexico
      return { symbol: "MX$", code: "MXN", locale: "es-MX" }
    case "27": // South Africa
      return { symbol: "R", code: "ZAR", locale: "en-ZA" }
    case "234": // Nigeria
      return { symbol: "₦", code: "NGN", locale: "en-NG" }
    case "254": // Kenya
      return { symbol: "KSh", code: "KES", locale: "en-KE" }
    default:
      return { symbol: "₹", code: "INR", locale: "en-IN" }
  }
}

export function formatCurrency(amount: number, phoneNumber: string | null): string {
  const { symbol, locale } = getCurrencyFromPhone(phoneNumber)
  
  try {
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
    
    return `${symbol}${formatted}`
  } catch {
    return `${symbol}${amount.toFixed(2)}`
  }
}
