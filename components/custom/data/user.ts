// import { EntryStatuses } from "@/lib/enums"

// export const tournaments = [
//     {
//         _id: "T123456",
//         name: "C-ONE Badminton Tournament V.09",
//         isActive: true,
//         settings: {
//             hasEB: true,
//             hasFreeJersey: true,
//             ticketNumber: 150
//         },
//         dates: {
//             registrationStart: "2025-09-01",
//             registrationEnd: "2025-09-30",
//             earlyBirdReEnd: "2025-09-15",
//             earlyBirdPaymentEnd: "2025-09-20",
//             registrationPaymentEnd: "2025-09-30",
//             tournamentStart: "2025-08-21",
//             tournamentEnd: "2025-08-25"
//         },
//         banks: [
//             {
//                 name: "Bank 1",
//                 bankNumber: "1234567890",
//                 image: "bank1-logo.png"
//             },
//             {
//                 name: "Bank 2",
//                 bankNumber: "0987654321",
//                 image: "bank2-logo.png"
//             }
//         ]
//     },
//     {
//         _id: "T654321",
//         name: "C-ONE Badminton Tournament V.8",
//         isActive: false,
//         settings: {
//             hasEB: false,
//             hasFreeJersey: false,
//             ticketNumber: 100
//         },
//         dates: {
//             registrationStart: "2025-10-01",
//             registrationEnd: "2025-10-15",
//             earlyBirdReEnd: "2025-10-05",
//             earlyBirdPaymentEnd: "2025-10-10",
//             registrationPaymentEnd: "2025-10-15",
//             tournamentStart: "2025-10-20",
//             tournamentEnd: "2025-10-22"
//         },
//         banks: [
//             {
//                 name: "Bank A",
//                 bankNumber: "1122334455",
//                 image: "bankA-logo.png"
//             }
//         ]
//     }
// ]

// export const events = [
//     {
//         _id: "607f1f77bcf86cd799439016",
//         name: "Mixed",
//         type: "DOUBLES",
//         gender: "MIXED",
//         pricePerPlayer: 3000,
//         earlyBirdPricePerPlayer: 40,
//         location: "LOCAL",
//         minValidBirthdate: "2000-01-01",
//         maxValidBirthdate: "2025-10-07",
//         tournamentID: "T123456",
//         currency: "PHP",
//         level: "INTERMEDIATE",
//         extendedRegDate: "2023-09-15",
//         extendedPaymentDate: "2023-09-20",
//         isDissolver: false
//     },
//     {
//         _id: "607f1f77bcf86cd799439017",
//         name: "Men's",
//         type: "SINGLES",
//         gender: "MALE",
//         pricePerPlayer: 150,
//         earlyBirdPricePerPlayer: 50,
//         location: "LOCAL",
//         minValidBirthdate: "1995-01-01",
//         maxValidBirthdate: "2025-10-07",
//         tournamentID: "T123456",
//         currency: "PHP",
//         level: "INTERMEDIATE",
//         extendedRegDate: "2023-09-10",
//         extendedPaymentDate: "2023-09-17",
//         isDissolver: false
//     }
// ]

// export const players = [
//     {
//         _id: "P001",
//         firstName: "Mason",
//         middleName: "James",
//         lastName: "Doe",
//         birthday: "1990-05-15",
//         ext: "Jr.",
//         gender: "FEMALE",
//         email: "mason.doe@example.com",
//         contactNumber: "+1234567890",
//         videos: [
//             {
//                 videoTitle: "Player 1 Introduction",
//                 videoUrl: "https://example.com/video1",
//                 uploadedOn: "2023-09-10"
//             },
//             {
//                 videoTitle: "Player 1 Match Highlights",
//                 videoUrl: "https://example.com/video2",
//                 uploadedOn: "2023-09-12"
//             }
//         ],
//         level: { status: "INTERMEDIATE", dateLevelled: "2023-08-01" },
//         validRequirement: [
//             {
//                 dateUploaded: "2023-09-01",
//                 url: "https://example.com/birth-certificate",
//                 type: "BIRTH_CERT"
//             },
//             {
//                 dateUploaded: "2023-09-03",
//                 url: "https://example.com/id-card",
//                 type: "ID"
//             }
//         ]
//     },
//     {
//         _id: "P002",
//         firstName: "Jerome",
//         middleName: "Lee",
//         lastName: "Smith",
//         birthday: "1992-11-25",
//         ext: "",
//         gender: "FEMALE",
//         email: "jerome.smith@example.com",
//         contactNumber: "+1987654321",
//         videos: [
//             {
//                 videoTitle: "Player 2 Training Session",
//                 videoUrl: "https://example.com/video3",
//                 uploadedOn: "2023-09-05"
//             }
//         ],
//         level: { status: "ADVANCED", dateLevelled: "2023-06-15" },
//         validRequirement: [
//             {
//                 dateUploaded: "2023-09-02",
//                 url: "https://example.com/birth-certificate-jerome",
//                 type: "BIRTH_CERT"
//             }
//         ]
//     }
// ]

// export const jerseys = [
//     {
//         _id: "507f1f77bcf86cd799439011",
//         size: "M",
//         tournament_id: "T123456",
//         status: "PENDING",
//         player_id: "P001"
//     },
//     {
//         _id: "507f1f77bcf86cd799439012",
//         size: "L",
//         tournament_id: "T123456",
//         status: "PENDING",
//         player_id: "P002"
//     },
//     {
//         _id: "507f1f77bcf86cd799439013",
//         size: "XL",
//         tournament_id: "T123456",
//         status: "PENDING",
//         player_id: "P003"
//     }
// ]

// export const users = [
//     {
//         _id: "607f1f77bcf86cd799439011",
//         name: "Mason",
//         username: "mason_doe",
//         password: "hashed_password_123",
//         email: "mason.doe@example.com",
//         role: "ADMIN"
//     },
//     {
//         _id: "607f1f77bcf86cd799439012",
//         name: "Jerome",
//         username: "jerome_smith",
//         password: "hashed_password_456",
//         email: "jerome.smith@example.com",
//         role: "ORGANIZER"
//     },
//     {
//         _id: "607f1f77bcf86cd799439013",
//         name: "Jemima Japay",
//         username: "jemima_japay",
//         password: "hashed_password_789",
//         email: "jemima.japay@example.com",
//         role: "CHECKER"
//     },
//     {
//         _id: "607f1f77bcf86cd799439014",
//         name: "Bob",
//         username: "bob_johnson",
//         password: "hashed_password_101",
//         email: "bob.johnson@example.com",
//         role: "SUPPORT"
//     },
//     {
//         _id: "607f1f77bcf86cd799439015",
//         name: "Charlie",
//         username: "charlie_green",
//         password: "hashed_password_202",
//         email: "charlie.green@example.com",
//         role: "ACCOUNTING"
//     }
// ]

// export const payments = [
//     {
//         _id: "PAY001",
//         imageURL: "https://example.com/payment1.png",
//         paymentStatus: [
//             { status: "PENDING", date: "2025-10-01" },
//             { status: "PARTIAL", date: "2025-10-03" }
//         ],
//         dateUploaded: "2025-10-01",
//         referenceNumber: "REF123456",
//         amount: 100,
//         entryID: "607f1f77bcf86cd799439011",
//         amountDifference: 50,
//         comment: "Payment partially made, waiting for the remainder"
//     },
//     {
//         _id: "PAY002",
//         imageURL: "https://example.com/payment2.png",
//         paymentStatus: [
//             { status: "VERIFIED", date: "2025-10-02" }
//         ],
//         dateUploaded: "2025-10-02",
//         referenceNumber: "REF789012",
//         amount: 150,
//         entryID: "607f1f77bcf86cd799439012",
//         amountDifference: 0,
//         comment: "Full payment verified"
//     },
//     {
//         _id: "PAY003",
//         imageURL: "https://example.com/payment3.png",
//         paymentStatus: [
//             { status: "REJECTED", date: "2025-10-04" }
//         ],
//         dateUploaded: "2025-10-04",
//         referenceNumber: "REF555999",
//         amount: 200,
//         entryID: "607f1f77bcf86cd799439013",
//         amountDifference: -200,
//         comment: "Duplicate payment found and rejected"
//     }
// ]

// export const entries = [
//     {
//         _id: "607f1f77bcf86cd799439011",
//         entryKey: "kajKER55",
//         entryNumber: "V8-009809",
//         event: { event_id: "607f1f77bcf86cd799439016" },
//         club: "Mordo",
//         connectedPlayer1: null,
//         connectedPlayer2: null,
//         EntryStatus: [
//             {
//                 date: "2023-09-10",
//                 status: "PENDING"
//             },
//             {
//                 date: "2023-09-11",
//                 status: "LVL_APPROVED"
//             },
//             {
//                 date: "2023-09-12",
//                 status: "LVL_VERIFIED"
//             },
//             {
//                 date: "2023-09-13",
//                 status: "PAYMENT_PENDING"
//             },
//         ],
//         isInSoftware: false,
//         isEarlyBird: false,
//         player1Entry: {
//             player_id: "P001",
//             jersey_id: "507f1f77bcf86cd799439011"
//         },
//         player2Entry: {
//             player_id: "P002",
//             jersey_id: "507f1f77bcf86cd799439012"
//         },
//         payments: {
//             _id: "PAY001"
//         }
//     },
//     {
//         _id: "607f1f77bcf86cd799439012",
//         entryKey: "kajKER56",
//         entryNumber: "V8-009810",
//         event: { event_id: "607f1f77bcf86cd799439017" },
//         club: "Club Example",
//         connectedPlayer1: null,
//         connectedPlayer2: null,
//         EntryStatus: [
//             {
//                 date: "2023-09-10",
//                 status: "PENDING"
//             },
//             {
//                 date: "2023-09-11",
//                 status: "LVL_APPROVED"
//             },
//             {
//                 date: "2023-09-12",
//                 status: "LVL_VERIFIED"
//             },
//             {
//                 date: "2023-09-13",
//                 status: "PAYMENT_PENDING"
//             },
//             {
//                 date: "2023-09-14",
//                 status: "PAYMENT_PARTIAL"
//             },
//             {
//                 date: "2023-09-14",
//                 status: "PAYMENT_VERIFIED"
//             },
//         ],
//         isInSoftware: false,
//         isEarlyBird: false,
//         player1Entry: {
//             player_id: "P001",
//             jersey_id: "507f1f77bcf86cd799439013"
//         },
//         player2Entry: {
//             player_id: "",
//             jersey_id: ""
//         },
//         payments: {
//             _id: "PAY002"
//         }
//     }
// ]

// // payment = []  Dari ma butang ang payment