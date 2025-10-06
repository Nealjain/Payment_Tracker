import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface ReportData {
  period: string
  startDate: string
  endDate: string
  totalIncome: number
  totalExpenses: number
  netBalance: number
  payments: any[]
  groupExpenses: any[]
  categoryBreakdown: { [key: string]: { income: number; expense: number } }
  userName: string
}

export function generatePDFReport(data: ReportData): jsPDF {
  const doc = new jsPDF()
  const primaryColor = [139, 92, 246] // Purple
  const greenColor = [34, 197, 94]
  const redColor = [239, 68, 68]
  
  // Header with logo/branding
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, 210, 40, "F")
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text(`${data.period} Financial Report`, 14, 20)
  
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Generated for: ${data.userName}`, 14, 28)
  doc.text(`Period: ${data.startDate} to ${data.endDate}`, 14, 33)
  
  doc.setTextColor(0, 0, 0)
  
  // Summary section with visual cards
  let yPos = 50
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("Financial Summary", 14, yPos)
  
  yPos += 10
  
  // Draw summary cards
  const cardWidth = 60
  const cardHeight = 25
  const cardSpacing = 5
  
  // Income Card
  doc.setFillColor(34, 197, 94, 0.1)
  doc.roundedRect(14, yPos, cardWidth, cardHeight, 3, 3, "F")
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text("Total Income", 18, yPos + 8)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(34, 197, 94)
  doc.text(`₹${data.totalIncome.toFixed(2)}`, 18, yPos + 18)
  
  // Expense Card
  doc.setFillColor(239, 68, 68, 0.1)
  doc.roundedRect(14 + cardWidth + cardSpacing, yPos, cardWidth, cardHeight, 3, 3, "F")
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text("Total Expenses", 18 + cardWidth + cardSpacing, yPos + 8)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(239, 68, 68)
  doc.text(`₹${data.totalExpenses.toFixed(2)}`, 18 + cardWidth + cardSpacing, yPos + 18)
  
  // Balance Card
  const balanceColor = data.netBalance >= 0 ? greenColor : redColor
  doc.setFillColor(balanceColor[0], balanceColor[1], balanceColor[2], 0.1)
  doc.roundedRect(14 + (cardWidth + cardSpacing) * 2, yPos, cardWidth, cardHeight, 3, 3, "F")
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text("Net Balance", 18 + (cardWidth + cardSpacing) * 2, yPos + 8)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(balanceColor[0], balanceColor[1], balanceColor[2])
  doc.text(`₹${data.netBalance.toFixed(2)}`, 18 + (cardWidth + cardSpacing) * 2, yPos + 18)
  
  yPos += cardHeight + 15
  doc.setTextColor(0, 0, 0)
  doc.setFont("helvetica", "normal")
  
  // Income vs Expense Bar Chart
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Income vs Expenses", 14, yPos)
  yPos += 10
  
  const chartWidth = 180
  const chartHeight = 20
  const maxAmount = Math.max(data.totalIncome, data.totalExpenses)
  
  // Income bar
  doc.setFillColor(34, 197, 94)
  const incomeBarWidth = maxAmount > 0 ? (data.totalIncome / maxAmount) * chartWidth : 0
  doc.roundedRect(14, yPos, incomeBarWidth, 8, 2, 2, "F")
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  if (incomeBarWidth > 30) {
    doc.text(`₹${data.totalIncome.toFixed(2)}`, 18, yPos + 6)
  }
  
  yPos += 10
  
  // Expense bar
  doc.setFillColor(239, 68, 68)
  const expenseBarWidth = maxAmount > 0 ? (data.totalExpenses / maxAmount) * chartWidth : 0
  doc.roundedRect(14, yPos, expenseBarWidth, 8, 2, 2, "F")
  doc.setTextColor(255, 255, 255)
  if (expenseBarWidth > 30) {
    doc.text(`₹${data.totalExpenses.toFixed(2)}`, 18, yPos + 6)
  }
  
  yPos += 15
  doc.setTextColor(0, 0, 0)
  doc.setFont("helvetica", "normal")
  
  // Category breakdown with bars
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Category Breakdown", 14, yPos)
  yPos += 8
  
  const categories = Object.entries(data.categoryBreakdown)
  const maxCategoryAmount = Math.max(...categories.map(([_, amounts]) => amounts.income + amounts.expense), 1)
  
  categories.slice(0, 8).forEach(([category, amounts]) => {
    const total = amounts.income + amounts.expense
    const barWidth = (total / maxCategoryAmount) * 150
    
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(category, 14, yPos + 4)
    
    // Bar
    doc.setFillColor(139, 92, 246)
    doc.roundedRect(70, yPos, barWidth, 6, 1, 1, "F")
    
    // Amount
    doc.setTextColor(100, 100, 100)
    doc.text(`₹${total.toFixed(2)}`, 70 + barWidth + 3, yPos + 4)
    
    yPos += 8
  })
  
  if (categories.length === 0) {
    doc.setFontSize(9)
    doc.setTextColor(150, 150, 150)
    doc.text("No category data available", 14, yPos)
    yPos += 10
  }
  
  yPos += 10
  
  // Check if new page needed
  if (yPos > 240) {
    doc.addPage()
    yPos = 20
  }
  
  // Payments table
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Recent Transactions", 14, yPos)
  
  const paymentsData = data.payments.slice(0, 20).map((payment) => [
    new Date(payment.date).toLocaleDateString(),
    payment.description,
    payment.category || "N/A",
    payment.type === "income" ? `+₹${Number(payment.amount).toFixed(2)}` : `-₹${Number(payment.amount).toFixed(2)}`,
  ])
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [["Date", "Description", "Category", "Amount"]],
    body: paymentsData.length > 0 ? paymentsData : [["No transactions", "-", "-", "-"]],
    theme: "striped",
    headStyles: { fillColor: primaryColor as any, textColor: [255, 255, 255] as any },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 70 },
      2: { cellWidth: 40 },
      3: { cellWidth: 40, halign: "right" },
    },
  })
  
  // Group expenses (if any)
  if (data.groupExpenses.length > 0) {
    const groupY = (doc as any).lastAutoTable.finalY || 200
    
    // Add new page if needed
    if (groupY > 240) {
      doc.addPage()
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Group Expenses", 14, 20)
      
      const groupData = data.groupExpenses.slice(0, 15).map((expense) => [
        expense.group_name || "Unknown",
        expense.description,
        `₹${Number(expense.amount).toFixed(2)}`,
        expense.is_settled ? "✓ Settled" : "⏳ Pending",
      ])
      
      autoTable(doc, {
        startY: 25,
        head: [["Group", "Description", "Amount", "Status"]],
        body: groupData,
        theme: "striped",
        headStyles: { fillColor: primaryColor as any, textColor: [255, 255, 255] as any },
        styles: { fontSize: 9 },
      })
    } else {
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Group Expenses", 14, groupY + 10)
      
      const groupData = data.groupExpenses.slice(0, 15).map((expense) => [
        expense.group_name || "Unknown",
        expense.description,
        `₹${Number(expense.amount).toFixed(2)}`,
        expense.is_settled ? "✓ Settled" : "⏳ Pending",
      ])
      
      autoTable(doc, {
        startY: groupY + 15,
        head: [["Group", "Description", "Amount", "Status"]],
        body: groupData,
        theme: "striped",
        headStyles: { fillColor: primaryColor as any, textColor: [255, 255, 255] as any },
        styles: { fontSize: 9 },
      })
    }
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    )
  }
  
  return doc
}

export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename)
}
