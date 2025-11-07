// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"

// type Props = {
//   isOpen: boolean
//   onClose: () => void
//   category: { name: string; type: "Doubles" | "Singles" } | null
// }

// export function CategoryModal({ isOpen, onClose, category }: Props) {
//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>{category ? `Register for ${category.name}` : "Select a Category"}</DialogTitle>
//         </DialogHeader>

//         {category && (
//           <div className="py-4 text-gray-700">
//             You have selected <strong>{category.name}</strong> ({category.type}). <br />
//             Please proceed with registration and payment instructions.
//           </div>
//         )}

//         <DialogFooter>
//           <Button onClick={onClose} variant="outline">
//             Cancel
//           </Button>
//           <Button className="bg-green-600 hover:bg-green-700 text-white">Confirm Registration</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }
