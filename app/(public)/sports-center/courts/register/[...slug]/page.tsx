// // page.tsx
// "use client"

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Button } from '@/components/ui/button'
// import { CalendarIcon, ChevronRight, Phone, UploadIcon, User, Check, Users, Mail } from 'lucide-react'
// import { use, useEffect, useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
// import { format } from 'date-fns'
// import { Calendar } from '@/components/ui/calendar'
// import { Switch } from '@/components/ui/switch'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { createFormSchema, FormData } from '@/components/custom/data/validator'
// import Header from '@/components/custom/header-white'
// import ScrollIndicator from '@/components/custom/scroll-indicator'
// import Link from 'next/link'
// import Image from 'next/image'
// import FloatingChatWidget from '@/components/custom/ticket'
// import { useMutation, useQuery } from '@apollo/client/react'
// import { PUBLIC_TOURNAMENTS } from '@/graphql/events/queries'
// import { REGISTRY_ENTRY } from '@/graphql/registration/resolver'
// import { PublicTournamentsData } from '@/components/custom/category-selection'

// interface RegistrationPageProps {
//     params: Promise<{ slug: string[] }>
// }

// // Success Modal Component
// const SuccessModal = ({ isOpen, onClose, message }: {
//     isOpen: boolean;
//     onClose: () => void;
//     message: string;
// }) => {
//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
//             <div className="animate-in fade-in-90 zoom-in-90 duration-300 mx-4 w-full max-w-md">
//                 <div className="bg-white rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 scale-100">
//                     <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500 animate-in zoom-in-50 duration-500">
//                         <Check className="h-10 w-10 text-white animate-in fade-in-50 duration-700 delay-300" />
//                     </div>

//                     <h3 className="text-2xl font-bold text-gray-900 mb-3 animate-in fade-in-50 duration-500 delay-200">
//                         Successfully Registered!
//                     </h3>

//                     <p className="text-gray-600 mb-6 animate-in fade-in-50 duration-500 delay-300">
//                         {message}
//                     </p>

//                     <Button
//                         onClick={onClose}
//                         className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-all transform hover:scale-105 animate-in fade-in-50 duration-500 delay-400"
//                     >
//                         OK
//                     </Button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default function Page({ params }: RegistrationPageProps) {
//     const paramData = use(params)
//     const [tournamentId, eventId] = paramData.slug ?? []
//     console.log("paramData:", paramData)
//     const { data, loading, error } = useQuery<PublicTournamentsData>(PUBLIC_TOURNAMENTS, {
//         variables: { id: eventId },
//         skip: !eventId,
//     })

//     const [registerEntry, { loading: submitting, error: submitError }] = useMutation(REGISTRY_ENTRY)

//     // State for success modal
//     const [showSuccessModal, setShowSuccessModal] = useState(false)
//     const [successMessage, setSuccessMessage] = useState("")

//     // State for sync switches
//     const [syncPlayer1, setSyncPlayer1] = useState(false)
//     const [syncPlayer2, setSyncPlayer2] = useState(false)


//     const tournaments = data?.publicTournaments ?? []
//     const tournament =
//         tournaments.find((t: any) => t._id === tournamentId) ??
//         tournaments.find((t: any) => t.isActive)
//     const event =
//         tournament?.events.find((e: any) => e._id === eventId) ??
//         tournament?.events?.[0]

//     const hasFreeJersey = tournament?.settings?.hasFreeJersey || false
//     const dynamicFormSchema = createFormSchema(event?.type || "SINGLES", hasFreeJersey)

//     const form = useForm<FormData>({
//         resolver: zodResolver(dynamicFormSchema),
//         defaultValues: {
//             category: '',
//             club: '',
//             clubEmail: '',
//             clubContactNumber: '',
//             player1FirstName: '',
//             player1LastName: '',
//             player1MiddleName: '',
//             player1Suffix: '',
//             player1Birthday: '',
//             player1JerseySize: '',
//             player1Gender: '',
//             player1IdUpload: null,
//             contactEmailPlayer1: '',
//             contactNumberPlayer1: '',
//             player2FirstName: '',
//             player2LastName: '',
//             player2MiddleName: '',
//             player2Suffix: '',
//             player2Birthday: '',
//             player2JerseySize: '',
//             player2Gender: '',
//             player2IdUpload: null,
//             contactEmailPlayer2: '',
//             contactNumberPlayer2: '',
//         }
//     })

//     const autoGender = event ? (
//         /women|girls|female/i.test(event.gender) ? "FEMALE" :
//             /men|boys|male/i.test(event.gender) ? "MALE" : null
//     ) : null;

//     useEffect(() => {
//         const clubEmail = form.watch('clubEmail')
//         const clubContactNumber = form.watch('clubContactNumber')

//         if (syncPlayer1) {
//             form.setValue('contactEmailPlayer1', clubEmail ?? '')
//             form.setValue('contactNumberPlayer1', clubContactNumber ?? '')
//         }

//         if (syncPlayer2 && event?.type === "DOUBLES") {
//             form.setValue('contactEmailPlayer2', clubEmail ?? '')
//             form.setValue('contactNumberPlayer2', clubContactNumber ?? '')
//         }
//     }, [form.watch('clubEmail'), form.watch('clubContactNumber'), syncPlayer1, syncPlayer2, event?.type, form])

//     useEffect(() => {
//         console.log("Gender Debug:", {
//             eventGender: event?.gender,
//             autoGender,
//             isMixed: /mixed/i.test(event?.gender || "")
//         })
//     }, [event, autoGender])

//     useEffect(() => {
//         if (!event) return

//         if (autoGender) {
//             form.setValue("player1Gender", autoGender)
//             form.setValue("player2Gender", autoGender)
//         }
//     }, [event, form, autoGender])

//     const onSubmit = async (formData: FormData) => {
//         console.log("=== FORM SUBMISSION TRIGGERED ===");
//         console.log("Form Data:", JSON.stringify(formData, null, 2));

//         // Check if form is valid
//         const isValid = await form.trigger();
//         console.log("Form is valid:", isValid);

//         if (!isValid) {
//             console.log("Form validation failed - check required fields");
//             return;
//         }

//         try {
//             console.log("Preparing GraphQL mutation input...");

//             // Ensure gender is properly set for non-mixed events
//             const finalFormData = {
//                 ...formData,
//                 // Force set gender for non-mixed events to ensure it's not empty
//                 player1Gender: formData.player1Gender || autoGender || "",
//                 player2Gender: formData.player2Gender || autoGender || "",
//             };

//             // Convert birthday string to ISO string for GraphQL DateTime
//             const convertToISODateTime = (dateString?: string) => {
//                 if (!dateString) return "";
//                 // Add time component to make it a full DateTime
//                 return new Date(dateString + 'T00:00:00.000Z').toISOString();
//             };

//             // Create base player entry without jerseySize
//             const createPlayerEntry = (playerData: any, playerNum: number) => {
//                 const baseEntry = {
//                     firstName: playerData[`player${playerNum}FirstName`],
//                     lastName: playerData[`player${playerNum}LastName`],
//                     middleName: playerData[`player${playerNum}MiddleName`],
//                     suffix: playerData[`player${playerNum}Suffix`],
//                     birthDate: convertToISODateTime(playerData[`player${playerNum}Birthday`]),
//                     email: playerData[`contactEmailPlayer${playerNum}`],
//                     phoneNumber: playerData[`contactNumberPlayer${playerNum}`],
//                     gender: playerData[`player${playerNum}Gender`],
//                     // idUpload: playerData[`player${playerNum}IdUpload`]?.[0],
//                 };

//                 // Only include jerseySize if hasFreeJersey is true AND it has a value
//                 if (hasFreeJersey && playerData[`player${playerNum}JerseySize`]) {
//                     return {
//                         ...baseEntry,
//                         jerseySize: playerData[`player${playerNum}JerseySize`]
//                     };
//                 }

//                 return baseEntry;
//             };

//             const input = {
//                 event: eventId,
//                 club: finalFormData.club,
//                 player1Entry: createPlayerEntry(finalFormData, 1),
//                 ...(event?.type === "DOUBLES" && {
//                     player2Entry: createPlayerEntry(finalFormData, 2)
//                 })
//             }

//             console.log("GraphQL Input:", JSON.stringify(input, null, 2));
//             console.log("Calling registerEntry mutation...");

//             const result = await registerEntry({
//                 variables: { input }
//             })

//             console.log("Mutation result:", result);

//             if (result.data?.registerEntry?.ok) {
//                 console.log("Registration successful!", result.data.registerEntry.message);
//                 const successMessage = result.data?.registerEntry?.message ?? "You have been registered successfully.";

//                 setSuccessMessage(successMessage);
//                 setShowSuccessModal(true);

//             } else {
//                 console.error("Registration failed:", result.data?.registerEntry?.message);
//                 alert(`Registration failed: ${result.data?.registerEntry?.message || "Unknown error"}`);
//             }
//         } catch (error) {
//             console.error("Submission error:", error);
//             alert("An error occurred during submission. Please check the console for details.");
//         }
//     }

//     // Handle modal close and form reset
//     const handleModalClose = () => {
//         setShowSuccessModal(false);
//         setSyncPlayer1(false);
//         setSyncPlayer2(false);

//         // Reset the form to brand new state
//         form.reset({
//             category: '',
//             club: '',
//             clubEmail: '',
//             clubContactNumber: '',
//             player1FirstName: '',
//             player1LastName: '',
//             player1MiddleName: '',
//             player1Suffix: '',
//             player1Birthday: '',
//             player1JerseySize: '',
//             player1Gender: '',
//             player1IdUpload: null,
//             contactEmailPlayer1: '',
//             contactNumberPlayer1: '',
//             player2FirstName: '',
//             player2LastName: '',
//             player2MiddleName: '',
//             player2Suffix: '',
//             player2Birthday: '',
//             player2JerseySize: '',
//             player2Gender: '',
//             player2IdUpload: null,
//             contactEmailPlayer2: '',
//             contactNumberPlayer2: '',
//         });

//         // Also clear any file input previews if needed
//         const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
//         fileInputs.forEach(input => {
//             input.value = '';
//         });
//     }

//     useEffect(() => {
//         console.log("Form errors:", form.formState.errors);
//         console.log("Current gender values:", {
//             player1Gender: form.getValues('player1Gender'),
//             player2Gender: form.getValues('player2Gender'),
//             autoGender
//         });
//     }, [form.formState.errors, form, autoGender]);

//     if (loading) return <div className="p-6 text-center">Loading registration form...</div>;
//     if (error) return <div className="p-6 text-red-500 text-center">Error: {error.message}</div>;

//     if (!event || !tournament) {
//         return <div className="p-6 text-center">Event or Tournament not found</div>;
//     }

//     // Determine if we should show gender field (only for mixed events)
//     const isMixed = /mixed/i.test(event?.gender || "")

//     return (
//         <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 py-8 px-4 ">
//             <Header />

//             <SuccessModal
//                 isOpen={showSuccessModal}
//                 onClose={handleModalClose}
//                 message={successMessage}
//             />

//             <div className="max-w-4xl mx-auto mt-20">

//                 <nav className="absolute top-20 left-10 flex items-center text-black text-sm">
//                     <Link
//                         href="/sports-center/"
//                         className="hover:text-[#2FB44D] font-medium transition-colors text-base underline"
//                     >
//                         Sports Center
//                     </Link>
//                     <ChevronRight className="w-4 h-4 mx-2 text-black" />
//                     <Link
//                         href="/sports-center/courts/#badminton-tournament"
//                         className="hover:text-[#2FB44D] font-medium transition-colors  text-base underline"
//                     >
//                         Courts
//                     </Link>
//                     <ChevronRight className="w-4 h-4 mx-2 text-black" />
//                     <span className="font-medium text-black text-base">Registration</span>
//                 </nav>

//                 <div className="text-center mb-8">
//                     <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
//                         <div className="text-4xl text-primary mb-1">{tournament.name}</div>
//                         <div className="flex items-center mt-3 justify-center gap-2 text-lg text-muted-foreground">
//                             <CalendarIcon className="w-5 h-5" />
//                             <span>
//                                 {`${new Date(
//                                     tournament.dates.tournamentStart
//                                 ).toLocaleString("default", { month: "long" })} 
//                 ${new Date(tournament.dates.tournamentStart).getDate()}–${new Date(
//                                     tournament.dates.tournamentEnd
//                                 ).getDate()}, 
//                 ${new Date(tournament.dates.tournamentStart).getFullYear()}`}
//                             </span>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {submitError && (
//                 <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
//                     <strong>Submission Error:</strong> {submitError.message}
//                 </div>
//             )}

//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>

//                     {/* UPDATED: Club Information Card with Contact Fields */}
//                     <Card className="relative max-w-7xl mx-auto bg-white border-4 border-gradient-to-r from-green-400 to-teal-500 shadow-xl">
//                         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"></div>
//                         <div className="absolute top-2 right-4 w-3 h-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full"></div>
//                         <div className="absolute top-2 left-4 w-3 h-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full"></div>

//                         <CardHeader className='pt-6'>
//                             <CardTitle className='flex items-center gap-2 text-green-800 justify-center'>
//                                 <div className="p-2 bg-gradient-to-r from-green-400 to-teal-500 rounded-lg">
//                                     <Users className="w-5 h-5 text-white" />
//                                 </div>
//                                 <span className="text-2xl">Club Information</span>
//                             </CardTitle>
//                             <CardDescription className="text-green-700 text-center">
//                                 Provide your club details. You can use these contact details for players below.
//                             </CardDescription>
//                         </CardHeader>

//                         <CardContent className='pb-6 space-y-6'>
//                             <div className="max-w-2xl mx-auto">
//                                 <FormField control={form.control} name="club" render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel className='text-green-800 text-lg'>
//                                             Club Name <span className='text-red-600'>*</span>
//                                         </FormLabel>
//                                         <FormControl>
//                                             <Input
//                                                 placeholder='Enter your club name'
//                                                 {...field}
//                                                 className='border-green-200 focus:border-green-500 bg-white py-6 text-lg'
//                                             />
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )} />
//                             </div>

//                             <div className="max-w-2xl mx-auto">
//                                 <div className="flex items-center gap-2 mb-4">
//                                     <div className="p-2 bg-gradient-to-r from-green-400 to-teal-500 rounded-lg">
//                                         <Mail className="w-5 h-5 text-white" />
//                                     </div>
//                                     <span className="text-green-800 font-semibold text-lg">
//                                         Club Contact Information (Optional)
//                                     </span>
//                                 </div>

//                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                                     <FormField control={form.control} name="clubEmail" render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="text-green-800">Email Address</FormLabel>
//                                             <FormControl>
//                                                 <Input
//                                                     placeholder="Enter club email"
//                                                     {...field}
//                                                     className="border-green-200 focus:border-green-500 bg-white py-5"
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )} />

//                                     <FormField
//                                         control={form.control}
//                                         name="clubContactNumber"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel className="text-green-800">
//                                                     Contact Number
//                                                 </FormLabel>
//                                                 <FormControl>
//                                                     <div className="flex items-center border rounded-md bg-white border-green-200 focus-within:border-green-500">
//                                                         <span className="px-3 text-gray-500">+63</span>
//                                                         <Input
//                                                             {...field}
//                                                             type="tel"
//                                                             placeholder="9123456789"
//                                                             maxLength={11}
//                                                             className="flex-1 border-0 focus-visible:ring-0 text-gray-800 py-5"
//                                                         />
//                                                     </div>
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>

//                                 <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
//                                     <p className="text-green-700 text-sm">
//                                         💡 <strong>Tip:</strong> Use the switches in player contact sections below to automatically fill their contact information with these club details.
//                                     </p>
//                                 </div>
//                             </div>
//                         </CardContent>
//                     </Card>

//                     <Card className="relative max-w-7xl mx-auto bg-white border-4 border-gradient-to-r from-green-400 to-teal-500 shadow-xl">
//                         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"></div>
//                         <div className="absolute top-2 right-4 w-3 h-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full"></div>
//                         <div className="absolute top-2 left-4 w-3 h-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full"></div>

//                         <CardHeader>
//                             <CardDescription className="mx-auto text-green-700 mt-2">
//                                 You are registering for this category
//                             </CardDescription>
//                             <div className="mx-auto p-3 bg-gradient-to-r from-teal-100 to-teal-200 border border-teal-200 rounded-xl shadow-md w-max">
//                                 <div className="flex items-center gap-2">
//                                     <div className="w-4 h-4 bg-gradient-to-r from-teal-200 to-teal-300 rounded-full shadow-inner"></div>
//                                     <CardTitle className="text-teal-700 text-lg font-semibold">
//                                         {event?.name} ({event?.type})
//                                     </CardTitle>
//                                 </div>
//                             </div>
//                         </CardHeader>

//                         <CardContent className="space-y-6">
//                             {(event?.type === "DOUBLES" ? [1, 2] : [1]).map(playerNum => (
//                                 <Card
//                                     key={playerNum}
//                                     className={`relative bg-white border-2 shadow-md p-4 ${playerNum === 1
//                                         ? 'border-gradient-to-r from-green-400 to-teal-500'
//                                         : 'border-gradient-to-r from-lime-400 to-emerald-500'
//                                         }`}
//                                 >
//                                     <CardHeader className="pt-4">
//                                         <CardTitle
//                                             className={`flex items-center gap-2 ${playerNum === 1 ? 'text-green-800' : 'text-lime-800'
//                                                 }`}
//                                         >
//                                             <div
//                                                 className={`p-2 rounded-lg ${playerNum === 1
//                                                     ? 'bg-gradient-to-r from-green-400 to-teal-500'
//                                                     : 'bg-gradient-to-r from-lime-400 to-emerald-500'
//                                                     }`}
//                                             >
//                                                 <User className="w-5 h-5 text-white" />
//                                             </div>
//                                             Personal Information for Player {playerNum}
//                                         </CardTitle>
//                                     </CardHeader>

//                                     <CardContent className="space-y-4">
//                                         {/* Personal Information Fields (same as before) */}
//                                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                             <FormField
//                                                 control={form.control}
//                                                 name={`player${playerNum}FirstName` as keyof FormData}
//                                                 render={({ field }) => (
//                                                     <FormItem>
//                                                         <FormLabel className={playerNum === 1 ? 'text-green-800' : 'text-lime-800'}>
//                                                             First Name <span className="text-red-500">*</span>
//                                                         </FormLabel>
//                                                         <FormControl>
//                                                             <Input {...field}
//                                                                 value={typeof field.value === "string" ? field.value : ""}
//                                                                 className="border-green-200 bg-white" />
//                                                         </FormControl>
//                                                         <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />

//                                             <FormField
//                                                 control={form.control}
//                                                 name={`player${playerNum}LastName` as keyof FormData}
//                                                 render={({ field }) => (
//                                                     <FormItem>
//                                                         <FormLabel className={playerNum === 1 ? 'text-green-800' : 'text-lime-800'}>
//                                                             Last Name <span className="text-red-500">*</span>
//                                                         </FormLabel>
//                                                         <FormControl>
//                                                             <Input {...field}
//                                                                 value={typeof field.value === "string" ? field.value : ""}
//                                                                 className="border-green-200 bg-white" />
//                                                         </FormControl>
//                                                         <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />

//                                             <FormField
//                                                 control={form.control}
//                                                 name={`player${playerNum}Birthday` as keyof FormData}
//                                                 render={({ field }) => (
//                                                     <FormItem className="flex flex-col">
//                                                         <FormLabel className={playerNum === 1 ? 'text-green-800' : 'text-lime-800'}>
//                                                             Birthday <span className="text-red-500">*</span>
//                                                         </FormLabel>
//                                                         <Popover>
//                                                             <PopoverTrigger asChild>
//                                                                 <FormControl>
//                                                                     <Button
//                                                                         variant="outline"
//                                                                         className={`w-full justify-start text-left font-normal border-green-200 bg-white ${!field.value && "text-muted-foreground"
//                                                                             }`}
//                                                                     >
//                                                                         {typeof field.value === "string" && field.value
//                                                                             ? format(new Date(field.value), "PPP")
//                                                                             : "Pick a date"}
//                                                                         <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                                                                     </Button>
//                                                                 </FormControl>
//                                                             </PopoverTrigger>
//                                                             <PopoverContent className="w-auto p-0" align="start">
//                                                                 <Calendar
//                                                                     mode="single"
//                                                                     selected={typeof field.value === "string" && field.value ? new Date(field.value) : undefined}
//                                                                     onSelect={(date) => {
//                                                                         field.onChange(date ? format(date, "yyyy-MM-dd") : "")
//                                                                     }}
//                                                                     initialFocus
//                                                                     captionLayout="dropdown"
//                                                                     fromYear={1800}
//                                                                     toYear={new Date().getFullYear()}
//                                                                     className="rounded-md border cursor-pointer"
//                                                                 />
//                                                             </PopoverContent>
//                                                         </Popover>
//                                                         <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />
//                                         </div>

//                                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//                                             <FormField
//                                                 control={form.control}
//                                                 name={`player${playerNum}MiddleName` as keyof FormData}
//                                                 render={({ field }) => (
//                                                     <FormItem>
//                                                         <FormLabel className={playerNum === 1 ? 'text-green-800' : 'text-lime-800'}>
//                                                             Middle Name
//                                                         </FormLabel>
//                                                         <FormControl>
//                                                             <Input
//                                                                 {...field}
//                                                                 value={typeof field.value === "string" ? field.value : ""}
//                                                                 className="border-green-200 bg-white w-full"
//                                                             />
//                                                         </FormControl>
//                                                         <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />
//                                             {hasFreeJersey && (
//                                                 <FormField
//                                                     control={form.control}
//                                                     name={`player${playerNum}JerseySize` as keyof FormData}
//                                                     render={({ field }) => (
//                                                         <FormItem>
//                                                             <FormLabel className={playerNum === 1 ? 'text-green-800' : 'text-lime-800'}>
//                                                                 Jersey Size <span className="text-red-500">*</span>
//                                                             </FormLabel>
//                                                             <FormControl>
//                                                                 <Select
//                                                                     onValueChange={field.onChange}
//                                                                     defaultValue={typeof field.value === "string" ? field.value : undefined}
//                                                                 >
//                                                                     <SelectTrigger className="border-green-200 bg-white w-full">
//                                                                         <SelectValue placeholder="Select Jersey Size" />
//                                                                     </SelectTrigger>
//                                                                     <SelectContent className="w-full">
//                                                                         <SelectItem value="XS">XS</SelectItem>
//                                                                         <SelectItem value="S">S</SelectItem>
//                                                                         <SelectItem value="M">M</SelectItem>
//                                                                         <SelectItem value="L">L</SelectItem>
//                                                                         <SelectItem value="XL">XL</SelectItem>
//                                                                         <SelectItem value="XXL">XXL</SelectItem>
//                                                                     </SelectContent>
//                                                                 </Select>
//                                                             </FormControl>
//                                                             <FormMessage />
//                                                         </FormItem>
//                                                     )}
//                                                 />
//                                             )}

//                                             <FormField
//                                                 control={form.control}
//                                                 name={`player${playerNum}Gender` as keyof FormData}
//                                                 render={({ field }) => (
//                                                     <FormItem>
//                                                         <FormLabel className={playerNum === 1 ? 'text-green-800' : 'text-lime-800'}>
//                                                             Gender <span className="text-red-500">*</span>
//                                                         </FormLabel>
//                                                         {isMixed ? (
//                                                             <Select onValueChange={field.onChange} value={field.value}>
//                                                                 <FormControl>
//                                                                     <SelectTrigger className="border-green-200 bg-white w-full">
//                                                                         <SelectValue placeholder="Select gender" />
//                                                                     </SelectTrigger>
//                                                                 </FormControl>
//                                                                 <SelectContent>
//                                                                     <SelectItem value="MALE">Male</SelectItem>
//                                                                     <SelectItem value="FEMALE">Female</SelectItem>
//                                                                 </SelectContent>
//                                                             </Select>
//                                                         ) : (
//                                                             <FormControl>
//                                                                 <Input
//                                                                     value={autoGender === 'MALE' ? 'Male' : 'Female'}
//                                                                     disabled
//                                                                     className="border-green-200 bg-gray-100 w-full"
//                                                                 />
//                                                             </FormControl>
//                                                         )}
//                                                         <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />
//                                         </div>

//                                         <FormField
//                                             control={form.control}
//                                             name={`player${playerNum}IdUpload` as keyof FormData}
//                                             render={({ field }) => {
//                                                 const [preview, setPreview] = useState<string | null>(null)

//                                                 return (
//                                                     <FormItem>
//                                                         <div className="border-2 border-dashed border-green-300 rounded-2xl p-6 bg-white flex flex-col items-center justify-center text-center gap-4">
//                                                             <div className="w-full flex flex-col text-left">
//                                                                 <div className="text-green-800 font-bold text-lg">
//                                                                     Important: Please Upload a Clear ID for Verification <span className="text-red-500">*</span>
//                                                                 </div>
//                                                                 <p className="text-gray-600 text-sm mt-1">
//                                                                     To Complete your Registration, we need a Clear Copy of any type of Valid ID.
//                                                                     Make sure the details are clearly visible and readable.
//                                                                 </p>
//                                                             </div>

//                                                             <div className="w-full flex justify-center">
//                                                                 {preview ? (
//                                                                     <Image
//                                                                         src={preview}
//                                                                         alt="Uploaded ID Preview"
//                                                                         width={400}
//                                                                         height={250}
//                                                                         className="max-w-full rounded-lg border shadow"
//                                                                     />
//                                                                 ) : (
//                                                                     <Image
//                                                                         src="/id.png"
//                                                                         alt="Sample ID"
//                                                                         width={400}
//                                                                         height={250}
//                                                                         className="max-w-full rounded-lg border shadow"
//                                                                     />
//                                                                 )}
//                                                             </div>

//                                                             <FormControl>
//                                                                 <label
//                                                                     htmlFor={`player${playerNum}IdUpload`}
//                                                                     className="cursor-pointer w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-green-300 rounded-xl bg-green-50 hover:bg-green-100 transition"
//                                                                 >
//                                                                     <UploadIcon className='w-8 h-8 text-green-600 mb-2' />

//                                                                     <span className="text-green-700 font-medium">
//                                                                         Drag & Drop your files or <span className="underline">Browse</span>
//                                                                     </span>

//                                                                     <input
//                                                                         id={`player${playerNum}IdUpload`}
//                                                                         type='file'
//                                                                         accept='image/*,.pdf'
//                                                                         className='hidden'
//                                                                         onChange={(e) => {
//                                                                             const file = e.target.files?.[0]

//                                                                             if (file) {
//                                                                                 field.onChange(e.target.files)
//                                                                                 if (file.type.startsWith('image/')) {
//                                                                                     const reader = new FileReader()
//                                                                                     reader.onloadend = () => {
//                                                                                         setPreview(reader.result as string)
//                                                                                     }
//                                                                                     reader.readAsDataURL(file)
//                                                                                 } else {
//                                                                                     setPreview(null)
//                                                                                 }
//                                                                             }
//                                                                         }}
//                                                                     />
//                                                                 </label>
//                                                             </FormControl>

//                                                             <FormMessage className='text-left text-red-400' />
//                                                         </div>
//                                                     </FormItem>
//                                                 )
//                                             }} />

//                                         {/* UPDATED: Contact Information with Sync Switch */}
//                                         <FormField
//                                             control={form.control}
//                                             name={`contactInfoPlayer${playerNum}` as any}
//                                             render={() => (
//                                                 <FormItem className="space-y-4 mt-6 border-green-200 rounded-xl p-6 bg-white">
//                                                     <div className="flex items-center gap-2 mb-4">
//                                                         <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
//                                                             <Phone className="w-5 h-5 text-white" />
//                                                         </div>
//                                                         <span className="text-green-800 font-semibold text-lg">
//                                                             Contact Information (Player {playerNum})
//                                                         </span>
//                                                     </div>

//                                                     {/* NEW: Sync Switch */}
//                                                     <div className="flex items-center space-x-2 p-3 bg-green-100/50 rounded-lg border border-green-200">
//                                                         <Switch
//                                                             checked={playerNum === 1 ? syncPlayer1 : syncPlayer2}
//                                                             onCheckedChange={(checked) => {
//                                                                 if (playerNum === 1) {
//                                                                     setSyncPlayer1(checked)
//                                                                     if (checked) {
//                                                                         form.setValue('contactEmailPlayer1', form.getValues('clubEmail') ?? '')
//                                                                         form.setValue('contactNumberPlayer1', form.getValues('clubContactNumber') ?? '')
//                                                                     }
//                                                                 } else {
//                                                                     setSyncPlayer2(checked)
//                                                                     if (checked) {
//                                                                         form.setValue('contactEmailPlayer2', form.getValues('clubEmail') ?? '')
//                                                                         form.setValue('contactNumberPlayer2', form.getValues('clubContactNumber') ?? '')
//                                                                     }
//                                                                 }
//                                                             }}
//                                                             className="cursor-pointer"
//                                                         />
//                                                         <label className="text-sm text-green-800 font-medium">
//                                                             Use Club Contact Information
//                                                         </label>
//                                                     </div>

//                                                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                                                         <FormField control={form.control} name={`contactEmailPlayer${playerNum}` as keyof FormData} render={({ field }) => (
//                                                             <FormItem>
//                                                                 <FormLabel className="text-green-800">Email Address<span className="text-red-600">*</span></FormLabel>
//                                                                 <FormControl>
//                                                                     <Input
//                                                                         placeholder="Enter Email Address"
//                                                                         {...field}
//                                                                         value={typeof field.value === 'string' ? field.value : ""}
//                                                                         disabled={playerNum === 1 ? syncPlayer1 : syncPlayer2}
//                                                                         className="border-green-200 focus:border-green-500 bg-white py-5"
//                                                                     />
//                                                                 </FormControl>
//                                                                 <FormMessage />
//                                                             </FormItem>
//                                                         )} />

//                                                         <FormField
//                                                             control={form.control}
//                                                             name={`contactNumberPlayer${playerNum}` as keyof FormData}
//                                                             render={({ field }) => (
//                                                                 <FormItem>
//                                                                     <FormLabel className="text-green-800">
//                                                                         Contact Number<span className="text-red-600">*</span>
//                                                                     </FormLabel>
//                                                                     <FormControl>
//                                                                         <div className="flex items-center border rounded-md bg-white border-green-200 focus-within:border-green-500">
//                                                                             <span className="px-3 text-gray-500">+63</span>
//                                                                             <Input
//                                                                                 {...field}
//                                                                                 type="tel"
//                                                                                 placeholder="9123456789"
//                                                                                 maxLength={11}
//                                                                                 disabled={playerNum === 1 ? syncPlayer1 : syncPlayer2}
//                                                                                 className="flex-1 border-0 focus-visible:ring-0 text-gray-800 py-5"
//                                                                                 value={typeof field.value === 'string' ? field.value : ""}
//                                                                             />
//                                                                         </div>
//                                                                     </FormControl>
//                                                                     <FormMessage />
//                                                                 </FormItem>
//                                                             )}
//                                                         />
//                                                     </div>
//                                                 </FormItem>
//                                             )}
//                                         />

//                                     </CardContent>
//                                 </Card>
//                             ))}
//                         </CardContent>
//                     </Card>

//                     <div className="flex justify-center">
//                         <Button
//                             type="submit"
//                             disabled={submitting}
//                             className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
//                         >
//                             {submitting ? "Submitting..." : "Submit Registration"}
//                         </Button>
//                     </div>
//                 </form>
//             </Form>

//             {/* <EventListBelow />  */}
//             <ScrollIndicator />
//             <FloatingChatWidget />
//         </div>
//     )
// }