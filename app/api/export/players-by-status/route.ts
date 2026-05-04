import * as XLSX from "xlsx"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const body = await req.json()
  const result = body.data

  const tournamentName = result.tournament
  const res = result.players.map((entry: any) => ({
    "Event Name": entry.eventName,
    "Entry Number": entry.entryNumber,
    Status: entry.status,
    "Player 1": entry.players[0]
      ? `${entry.players[0].firstName} ${entry.players[0].lastName}`
      : "",
    "Player 2": entry.players[1]
      ? `${entry.players[1].firstName} ${entry.players[1].lastName}`
      : "",
    "Contact Number": entry.players[0]?.phoneNumber === entry.players[1]?.phoneNumber
      ? entry.players[0]?.phoneNumber
      : `${entry.players[0]?.phoneNumber || ""} or ${entry.players[1]?.phoneNumber || ""}`,
  }))
  // Create worksheet with tournament name in first row
  const worksheet = XLSX.utils.json_to_sheet([[tournamentName]], {
    header: [tournamentName],
  })

  // Add events data starting from row 2
  XLSX.utils.sheet_add_json(worksheet, res, { origin: "A2" })

  //   // Merge B2:B4
  worksheet["!merges"] = [
    {
      s: { r: 0, c: 0 }, // B2 (0-based index)
      e: { r: 0, c: 4 }, // B4
    },
  ]

  // Set column A width
  worksheet["!cols"] = [
    { wch: 30 },
    { wch: 20 },
    { wch: 20 },
    { wch: 40 },
    { wch: 40 },
    { wch: 50 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Players by Status")

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  })

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=players-by-status.xlsx",
    },
  })
}
