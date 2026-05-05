import * as XLSX from "xlsx"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const body = await req.json()
  const result = body.data

  const tournamentName = result.tournament
  const entries = result.entries.map((event: any) => ({
    "Event Name": event.eventName,
    "Entry Number": event.entryNumber,
    "Entry Status": event.entryStatus,
    "Payment Status": event.paymentStatus,
    "In Software": event.inSoftware ? "Yes" : "No",
    "Club Name": event.club,
    "P1 FirstName": event.player1FirstName,
    "P1 LastName": event.player1LastName,
    "P1 Email": event.player1Email,
    "P1 Phone": event.player1Phone,
    "P1 Birthdate": event.player1Birthdate,
    "P1 Gender": event.player1Gender,
    "P1 Jersey Size": event.player1JerseySize,
    "P2 FirstName": event.player2FirstName,
    "P2 LastName": event.player2LastName,
    "P2 Email": event.player2Email,
    "P2 Phone": event.player2Phone,
    "P2 Birthdate": event.player2Birthdate,
    "P2 Gender": event.player2Gender,
    "P2 Jersey Size": event.player2JerseySize,
  }))
  // Create worksheet with tournament name in first row
  const worksheet = XLSX.utils.json_to_sheet([[tournamentName]], {
    header: [tournamentName],
  })

  // Add entries data starting from row 2
  XLSX.utils.sheet_add_json(worksheet, entries, { origin: "A2" })

  //   // Merge B2:B4
  worksheet["!merges"] = [
    {
      s: { r: 0, c: 0 }, // B2 (0-based index)
      e: { r: 0, c: 4 }, // B4
    },
  ]

  // Set column A width
  worksheet["!cols"] = [
    { wch: 35 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Entries")

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  })

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=entries.xlsx",
    },
  })
}
