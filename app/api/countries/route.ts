// // app/api/countries/route.ts

// export const runtime = "nodejs";

// export async function GET() {
//   try {
//     const res = await fetch(
//       "https://restcountries.com/v3.1/all?fields=name,cca2,cca3,flags,capital,region,subregion,population,area,languages",
//       {
//         cache: "no-store",
//         headers: {
//           "User-Agent": "my-nextjs-app",
//           "Accept": "application/json",
//         },
//       }
//     );

//     if (!res.ok) {
//       console.error("RESTCountries status:", res.status);
//       return Response.json(
//         { error: "Failed to fetch countries from RESTCountries" },
//         { status: 500 }
//       );
//     }

//     const data = await res.json();
//     return Response.json(data);

//   } catch (error) {
//     console.error("Server error fetching countries:", error);
//     return Response.json(
//       { error: "Server error" },
//       { status: 500 }
//     );
//   }
// }