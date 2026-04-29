import * as XLSX from "xlsx"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const body = await req.json()
  const result = body.data

  const tournamentName = result.tournament
  const events = result.events.map((event: any) => ({
    "Event Name": event.eventName,
    Pending: event.pending,
    Approved: event.approved,
    Paid: event.paid,
    "App. Total": event.paid + event.approved,
  }))
  // Create worksheet with tournament name in first row
  const worksheet = XLSX.utils.json_to_sheet([[tournamentName]], {
    header: [tournamentName],
  })

  // Add events data starting from row 2
  XLSX.utils.sheet_add_json(worksheet, events, { origin: "A2" })

  //   // Merge B2:B4
  worksheet["!merges"] = [
    {
      s: { r: 0, c: 0 }, // B2 (0-based index)
      e: { r: 0, c: 4 }, // B4
    },
  ]

  // Set column A width
  worksheet["!cols"] = [{ wch: 40 }]

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
