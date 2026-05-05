import * as XLSX from "xlsx"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const body = await req.json()
  const result = body.data

  const tournamentName = result.tournament

  const players = result.players.map((player: any) => ({
    "First Name": player.firstName,
    "Last Name": player.lastName,
    Email: player.email,
    // "Birthdate": player.birthDate,
    "Phone Number": player.phoneNumber,
    "Jersey Sizes": [...new Set(player.jerseySizes)].join(", "),
    "Entry Numbers": player.entryNumbers.join(", "),
  }))
  // Create worksheet with tournament name in first row
  const worksheet = XLSX.utils.json_to_sheet([[tournamentName]], {
    header: [tournamentName],
  })

  // Add players data starting from row 2
  XLSX.utils.sheet_add_json(worksheet, players, { origin: "A2" })

  //   // Merge B2:B4
  worksheet["!merges"] = [
    {
      s: { r: 0, c: 0 }, // B2 (0-based index)
      e: { r: 0, c: 4 }, // B4
    },
  ]

  // Set column A width
  worksheet["!cols"] = [
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 40 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "players")

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  })

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=players.xlsx",
    },
  })
}
