"use client"

import React, { useMemo, useState } from "react"
import { gql } from "@apollo/client"
import { format } from "date-fns"
import {
    ArrowLeft,
    Check,
    ChevronsUpDown,
    GitMerge,
    Loader2,
    AlertCircle,
    User,
    Mail,
    Phone,
    MapPin,
    Trophy,
    Calendar,
    History,
    FileCheck,
    Fingerprint,
    ShieldCheck,
    Info,
    FileText,
    ExternalLink,
    Eye
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { PlayerLevel } from "@/types/player.interface"
import { Gender } from "@/components/custom/data/items"
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react"

/** 
 * GQL DEFINITIONS
 */
const MERGE_PLAYERS = gql`
  mutation MergePlayers($input: MergePlayersInput!) {
    mergePlayers(input: $input) { ok message }
  }
`

const GET_PLAYER_DETAILS = gql`
  query GetPlayerMergeDetails($_id: ID!) {
    player(_id: $_id) {
      _id
      firstName
      middleName
      lastName
      suffix
      gender
      birthDate
      email
      phoneNumber
      isActive
      achievements
      createdAt
      updatedAt
      validDocuments {
        documentType
        documentURL
        dateUploaded
      }
      levels { 
        level 
        dateLevelled 
      }
      address { 
        fullAddress 
        street 
        zipCode 
        barangay { code name cityCode provinceCode regionCode psgcCode }
        city { code name provinceCode regionCode psgcCode classification }
        province { code name regionCode psgcCode }
        region { code name regionName psgcCode }
      }
    }
  }
`

const FIND_DUPLICATES = gql`
  query FindDuplicatePlayers {
    findDuplicatePlayers {
      count
      _id { lastName birthDate }
      players { _id }
    }
  }
`

const GET_ALL_PLAYERS = gql`
  query GetAllPlayersForMerge {
    players(first: 1000) {
      edges {
        node { _id name birthDate gender currentLevel }
      }
    }
  }
`

/** 
 * INTERFACES 
 */
interface IPlayerNode {
    _id: string
    name: string
    currentLevel: PlayerLevel | null
    gender: Gender
    birthDate: string
}

interface IFindDuplicatesData {
    findDuplicatePlayers: {
        count: number
        _id: { lastName: string; birthDate: string }
        players: { _id: string }[]
    }[]
}

interface IGetAllPlayersData {
    players: { edges: { node: IPlayerNode }[] }
}

interface IGetPlayerDetailsData {
    player: {
        _id: string;
        firstName: string;
        middleName?: string;
        lastName: string;
        suffix?: string;
        gender: Gender;
        birthDate: string;
        email?: string;
        phoneNumber?: string;
        isActive: boolean;
        achievements?: string[];
        createdAt: string;
        updatedAt: string;
        validDocuments?: { documentType: string; documentURL: string; dateUploaded: string }[];
        levels: { level: PlayerLevel; dateLevelled: string }[];
        address?: any;
    };
}

interface IMergePlayersData {
    mergePlayers: { ok: boolean; message: string };
}

interface IMergePlayersVariables {
    input: {
        targetPlayerId: string;
        sourcePlayerId: string;
        mergedData: any;
    };
}

const InfoRow = ({ label, data, icon: Icon, onClick }: { label: string, data: any, icon?: any, onClick?: () => void }) => (
    <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-50 last:border-0 items-center text-left">
        <div className="flex items-center gap-2 text-slate-400 shrink-0">
            {Icon && <Icon size={12} />}
            <span className="text-[10px] font-bold uppercase tracking-tight whitespace-nowrap">{label}</span>
        </div>
        <div
            className={cn(
                "col-span-2 text-xs font-medium text-clip",
                onClick ? "text-blue-600 cursor-pointer hover:underline flex items-center gap-1" : "text-slate-700"
            )}
            title={data?.toString()}
            onClick={onClick}
        >
            {data || <span className="text-slate-300 italic">None</span>}
            {onClick && data && <ExternalLink size={10} />}
        </div>
    </div>
);

export default function MergePlayersDialog() {
    const [step, setStep] = useState<"LIST" | "COMPARE">("LIST");
    const [openDropdown, setOpenDropdown] = useState(false);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
    const [selectedDuplicateId, setSelectedDuplicateId] = useState<string | null>(null);
    const [viewDoc, setViewDoc] = useState<{ type: string, url: string } | null>(null);

    const [sourceId, setSourceId] = useState<string | null>(null);
    const [targetId, setTargetId] = useState<string | null>(null);
    const [selections, setSelections] = useState<Record<string, string>>({});

    // Add fetchPolicy: 'network-only' to ensure fresh data, or use refetch
    const { data: allPlayersData, loading: loadingPlayers, refetch: refetchAllPlayers } = useQuery<IGetAllPlayersData>(GET_ALL_PLAYERS, {
        fetchPolicy: 'cache-and-network', // This will use cache first but update in background
    });

    const { data: dupData, refetch: refetchDuplicates } = useQuery<IFindDuplicatesData>(FIND_DUPLICATES);

    const [mergePlayers, { loading: merging }] = useMutation<IMergePlayersData, IMergePlayersVariables>(MERGE_PLAYERS)
    const [fetchSource, { data: sData, loading: sLoading }] = useLazyQuery<IGetPlayerDetailsData>(GET_PLAYER_DETAILS);
    const [fetchTarget, { data: tData, loading: tLoading }] = useLazyQuery<IGetPlayerDetailsData>(GET_PLAYER_DETAILS);
    const [fetchPreview, { data: previewData, loading: previewLoading }] = useLazyQuery<IGetPlayerDetailsData>(GET_PLAYER_DETAILS);

    const allPlayers = allPlayersData?.players.edges.map((e: any) => e.node) || [];

    const duplicateGroupForSelected = useMemo(() => {
        if (!selectedPlayerId || !allPlayers.length) return null;
        const selectedPlayer = allPlayers.find((p: any) => p._id === selectedPlayerId);
        if (!selectedPlayer) return null;

        const getLastName = (name: string) => name.trim().split(" ").pop()?.toLowerCase();
        const selectedLastName = getLastName(selectedPlayer.name);

        const duplicates = allPlayers.filter((p: any) =>
            p._id !== selectedPlayerId &&
            getLastName(p.name) === selectedLastName &&
            p.birthDate === selectedPlayer.birthDate
        );

        return duplicates.length > 0 ? { players: duplicates } : null;
    }, [selectedPlayerId, allPlayers]);

    const startMerge = (source: any, targetIdInGroup: string) => {
        setSourceId(source._id);
        setTargetId(targetIdInGroup);
        const fields = ['firstName', 'middleName', 'lastName', 'suffix', 'gender', 'email', 'phoneNumber', 'birthDate', 'address', 'validDocuments'];
        const initialSelections: Record<string, string> = {};
        fields.forEach(f => initialSelections[f] = targetIdInGroup);
        setSelections(initialSelections);
        fetchSource({ variables: { _id: source._id } });
        fetchTarget({ variables: { _id: targetIdInGroup } });
        setStep("COMPARE");
    };

    const resetAll = () => {
        setStep("LIST");
        setSelectedPlayerId("");
        setSelectedDuplicateId(null);
        setSourceId(null);
        setTargetId(null);
    }

    // Handle successful merge
    const handleMergeSuccess = async (data: IMergePlayersData) => {
        toast.success(data.mergePlayers.message);

        // Refetch all related queries to update the UI
        await Promise.all([
            refetchAllPlayers(),
            refetchDuplicates(),
        ]);

        resetAll();
    };

    const ComparisonRow = ({ label, field, valS, valT, isDocs }: any) => (
        <div className="grid grid-cols-3 gap-4 border-b py-3 hover:bg-slate-50/50 px-2 items-start">
            <span className="text-[10px] font-bold uppercase text-slate-400 mt-2">{label}</span>
            <div
                className={cn(
                    "p-2 rounded border-2 cursor-pointer transition-all overflow-hidden shrink-0",
                    selections[field] === sourceId ? "border-blue-500 bg-blue-50 shadow-sm font-semibold text-blue-700" : "border-transparent bg-white text-slate-500"
                )}
                onClick={() => setSelections({ ...selections, [field]: sourceId! })}
            >
                {isDocs && Array.isArray(valS) ? (
                    <div className="flex flex-col gap-1">
                        {valS.map((doc: any, i: number) => (
                            <div key={i} className="flex items-center justify-between gap-1 text-xs">
                                <span className="text-clip">{doc.documentType}</span>
                                <Button size="icon" variant="ghost" className="h-4 w-4 cursor-pointer" onClick={(e) => { e.stopPropagation(); setViewDoc({ type: doc.documentType, url: doc.documentURL }); }}>
                                    <Eye size={11} />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-clip" title={valS?.toString()}>{valS || "-"}</p>
                )}
            </div>
            <div
                className={cn(
                    "p-2 rounded border-2 cursor-pointer transition-all overflow-hidden shrink-0",
                    selections[field] === targetId ? "border-green-500 bg-green-50 shadow-sm font-semibold text-green-700" : "border-transparent bg-white text-slate-500"
                )}
                onClick={() => setSelections({ ...selections, [field]: targetId! })}
            >
                {isDocs && Array.isArray(valT) ? (
                    <div className="flex flex-col gap-1">
                        {valT.map((doc: any, i: number) => (
                            <div key={i} className="flex items-center justify-between gap-1 text-xs">
                                <span className="text-clip">{doc.documentType}</span>
                                <Button size="icon" variant="ghost" className="h-4 w-4 cursor-pointer" onClick={(e) => { e.stopPropagation(); setViewDoc({ type: doc.documentType, url: doc.documentURL }); }}>
                                    <Eye size={11} />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-clip" title={valT?.toString()}>{valT || "-"}</p>
                )}
            </div>
        </div>
    );

    return (
        <>
            <Dialog onOpenChange={(open) => !open && resetAll()}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm"><GitMerge className="size-4 mr-2" />Merge Tool</Button>
                </DialogTrigger>

                <DialogContent className={cn("transition-all duration-300 overflow-hidden", step === "LIST" ? "max-w-xl!" : "max-w-2xl!")}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-800">
                            {step === "COMPARE" && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setStep("LIST")}><ArrowLeft size={16} /></Button>}
                            <GitMerge className="size-5 text-blue-600" />
                            {step === "LIST" ? "Duplicate Records Scanner" : "Merge Selection Matrix"}
                        </DialogTitle>
                    </DialogHeader>

                    {step === "LIST" ? (
                        <>
                            <div className="space-y-4 py-4 flex-1 overflow-y-auto max-h-[70vh] pr-2 scrollbar-thin">
                                <div className="flex flex-col gap-2 px-1 text-left">
                                    <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Primary Record to Keep</Label>
                                    <Popover open={openDropdown} onOpenChange={setOpenDropdown}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between h-12 px-4 text-sm bg-slate-50/30 text-left">
                                                {selectedPlayerId ? (
                                                    <span className="font-semibold text-slate-900">{allPlayers.find((p: any) => p._id === selectedPlayerId)?.name}</span>
                                                ) : "Select player profile..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" onWheel={(e) => e.stopPropagation()} sideOffset={8}>
                                            <Command>
                                                <CommandInput placeholder="Search records..." />
                                                <CommandList>
                                                    <CommandEmpty>No player found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {allPlayers.map((player: any) => (
                                                            <CommandItem
                                                                key={player._id}
                                                                onSelect={() => { setSelectedPlayerId(player._id); setOpenDropdown(false); }}
                                                                className="flex items-center px-3 py-2 cursor-pointer"
                                                            >
                                                                <Checkbox checked={selectedPlayerId === player._id} className="h-4 w-4" />
                                                                <div className="flex flex-col w-full gap-0.5 pl-3 text-left">
                                                                    <div className="flex justify-between items-center w-full">
                                                                        <span className="text-sm font-bold text-slate-800">{player.name}</span>
                                                                        <Badge variant="outline" className="text-[9px] font-mono">{format(new Date(player.birthDate), "PP")}</Badge>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] text-slate-500 font-medium uppercase">{player.currentLevel || 'Unranked'}</span>
                                                                        {dupData?.findDuplicatePlayers.some((g: any) => g.players.some((p: any) => p._id === player._id)) && (
                                                                            <Badge variant="destructive" className="text-[8px] px-1 h-3.5 rounded-sm">DUPLICATE</Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {duplicateGroupForSelected ? (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 mx-1">
                                            <AlertCircle size={16} />
                                            <span className="text-[11px] font-semibold leading-none">Potential duplicate profile(s) found in the database.</span>
                                        </div>

                                        <Accordion type="single" collapsible className="w-full space-y-2 px-1" onValueChange={(value) => value && fetchPreview({ variables: { _id: value } })}>
                                            {duplicateGroupForSelected.players.map((dup: any) => (
                                                <AccordionItem key={dup._id} value={dup._id} className="border rounded-lg px-4 bg-white shadow-sm hover:shadow-md transition-all">
                                                    <div className="flex items-center gap-4 w-full [&_h3]:flex-1">
                                                        <Checkbox
                                                            className="h-5 w-5 rounded-full shrink-0"
                                                            checked={selectedDuplicateId === dup._id}
                                                            onCheckedChange={(checked) => setSelectedDuplicateId(checked ? dup._id : null)}
                                                        />
                                                        <AccordionTrigger className="hover:no-underline py-4 flex-1 [&>svg]:ml-auto">
                                                            <div className="flex flex-col items-start text-left">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-bold text-slate-900">{dup.name}</span>
                                                                    <Badge className={cn("text-[8px] h-3.5", dup.isActive ? "bg-green-500" : "bg-slate-300")}>{dup.isActive ? "ACTIVE" : "INACTIVE"}</Badge>
                                                                </div>
                                                            </div>
                                                        </AccordionTrigger>
                                                    </div>

                                                    <AccordionContent className="pt-0 pb-5 border-t border-slate-50">
                                                        {previewLoading ? (
                                                            <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6 text-blue-500" /></div>
                                                        ) : (previewData?.player?._id === dup._id) ? (
                                                            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                                                <div className="mt-4">
                                                                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-blue-100 text-left">
                                                                        <Fingerprint size={14} className="text-blue-500" />
                                                                        <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Personal Info</span>
                                                                    </div>
                                                                    <div className="bg-slate-50/50 rounded-lg p-3 space-y-0.5 shadow-inner">
                                                                        <InfoRow label="First Name" data={previewData?.player?.firstName} />
                                                                        <InfoRow label="Middle Name" data={previewData?.player?.middleName} />
                                                                        <InfoRow label="Last Name" data={previewData?.player?.lastName} />
                                                                        <InfoRow label="Suffix" data={previewData?.player?.suffix} />
                                                                        <InfoRow label="Gender" data={previewData?.player?.gender} />
                                                                        <InfoRow label="Birthdate" data={previewData?.player?.birthDate ? format(new Date(previewData?.player?.birthDate), "PPPP") : undefined} />
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-green-100 text-left">
                                                                        <Phone size={14} className="text-green-500" />
                                                                        <span className="text-[11px] font-black text-green-600 uppercase tracking-widest">Contact Details</span>
                                                                    </div>
                                                                    <div className="bg-slate-50/50 rounded-lg p-3 space-y-0.5 shadow-inner">
                                                                        <InfoRow label="Email" data={previewData?.player?.email} icon={Mail} />
                                                                        <InfoRow label="Phone Number" data={previewData?.player?.phoneNumber} icon={Phone} />
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-orange-100 text-left">
                                                                        <FileText size={14} className="text-orange-500" />
                                                                        <span className="text-[11px] font-black text-orange-600 uppercase tracking-widest">Valid Documents</span>
                                                                    </div>
                                                                    <div className="bg-slate-50/50 rounded-lg p-3 space-y-0.5 shadow-inner">
                                                                        {previewData?.player?.validDocuments && previewData.player.validDocuments.length > 0 ? (
                                                                            previewData.player.validDocuments.map((doc, idx) => (
                                                                                <InfoRow key={idx} label={doc.documentType} data="View Document" onClick={() => setViewDoc({ type: doc.documentType, url: doc.documentURL })} />
                                                                            ))
                                                                        ) : (
                                                                            <div className="text-[10px] text-slate-400 italic py-1 text-left">No documents uploaded.</div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-purple-100 text-left">
                                                                        <MapPin size={14} className="text-purple-500" />
                                                                        <span className="text-[11px] font-black text-purple-600 uppercase tracking-widest">Address & Location</span>
                                                                    </div>
                                                                    <div className="bg-slate-50/50 rounded-lg p-3 space-y-0.5 shadow-inner">
                                                                        <InfoRow label="Full Address" data={previewData?.player?.address?.fullAddress} />
                                                                        <InfoRow label="Barangay" data={previewData?.player?.address?.barangay?.name} />
                                                                        <InfoRow label="City" data={previewData?.player?.address?.city?.name} />
                                                                        <InfoRow label="Province" data={previewData?.player?.address?.province?.name} />
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-blue-100 text-left">
                                                                        <History size={14} className="text-blue-500" />
                                                                        <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Level History</span>
                                                                    </div>
                                                                    <div className="bg-white border rounded-lg divide-y overflow-hidden text-left">
                                                                        {previewData?.player?.levels && previewData.player.levels.length > 0 ? (
                                                                            previewData.player.levels.map((l, i) => (
                                                                                <div key={i} className="flex justify-between items-center px-4 py-2 hover:bg-slate-50 transition-colors">
                                                                                    <div className="flex items-center gap-2 text-left">
                                                                                        <FileCheck className="h-3 w-3 text-blue-400" />
                                                                                        <span className="text-xs font-bold text-slate-700">{l.level}</span>
                                                                                    </div>
                                                                                    <span className="text-[10px] font-mono text-slate-400">{format(new Date(l.dateLevelled), "MMM dd, yyyy")}</span>
                                                                                </div>
                                                                            ))
                                                                        ) : (
                                                                            <div className="p-4 text-xs text-slate-300 italic text-center">No rankings found.</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : null}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </div>
                                ) : selectedPlayerId ? (
                                    <div className="p-10 text-center border-2 border-dashed rounded-xl bg-slate-50/20 flex flex-col items-center gap-2 mx-1">
                                        <ShieldCheck className="h-6 w-6 text-green-400/50" />
                                        <p className="text-xs text-slate-400 font-medium italic">No redundant profiles detected for this selection.</p>
                                    </div>
                                ) : (
                                    <div className="p-16 text-center border-2 border-dashed rounded-xl flex flex-col items-center gap-3 mx-1 text-slate-300">
                                        <User className="h-10 w-10 text-slate-100" />
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Select a player to begin scan</p>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="border-t pt-4 mt-2">
                                <DialogClose asChild><Button variant="ghost" onClick={resetAll} className="h-11 px-6 text-slate-500">Cancel</Button></DialogClose>
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 shadow-sm font-bold text-xs h-11 px-8 transition-all text-white"
                                    disabled={!selectedDuplicateId || !selectedPlayerId}
                                    onClick={() => {
                                        const dupDetail = allPlayers.find((ap: any) => ap._id === selectedDuplicateId);
                                        if (dupDetail) startMerge(dupDetail, selectedPlayerId);
                                    }}
                                >
                                    Proceed to Compare & Merge
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <div className="py-2 animate-in slide-in-from-right-4 duration-300 overflow-hidden">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-red-50 border border-red-100 rounded-xl shadow-sm relative overflow-hidden text-left">
                                    <div className="absolute top-0 right-0 p-2 opacity-10"><History size={40} /></div>
                                    <Label className="text-[10px] text-red-600 font-bold uppercase tracking-widest">Source (Deleted)</Label>
                                    <h3 className="font-extrabold text-slate-800 text-lg text-clip">{sData?.player?.firstName} {sData?.player?.lastName}</h3>
                                </div>
                                <div className="p-4 bg-emerald-50 border border-green-100 rounded-xl shadow-sm relative overflow-hidden text-left">
                                    <div className="absolute top-0 right-0 p-2 opacity-10"><ShieldCheck size={40} /></div>
                                    <Label className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Target (Keep)</Label>
                                    <h3 className="font-extrabold text-slate-800 text-lg text-clip">{tData?.player?.firstName} {tData?.player?.lastName}</h3>
                                </div>
                            </div>

                            {sLoading || tLoading ? (
                                <div className="h-60 flex flex-col items-center justify-center gap-3">
                                    <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-tighter text-center">Analyzing data differences...</span>
                                </div>
                            ) : (
                                <div className="max-h-[45vh] overflow-y-auto border rounded-xl bg-white shadow-inner scrollbar-thin px-1 text-left">
                                    <div className="sticky top-0 bg-slate-100/90 backdrop-blur py-2.5 px-4 text-[10px] font-black text-slate-500 border-b uppercase z-10">Select Final Record Attributes</div>
                                    <ComparisonRow label="First Name" field="firstName" valS={sData?.player?.firstName} valT={tData?.player?.firstName} />
                                    <ComparisonRow label="Middle Name" field="middleName" valS={sData?.player?.middleName} valT={tData?.player?.middleName} />
                                    <ComparisonRow label="Last Name" field="lastName" valS={sData?.player?.lastName} valT={tData?.player?.lastName} />
                                    <ComparisonRow label="Suffix" field="suffix" valS={sData?.player?.suffix} valT={tData?.player?.suffix} />
                                    <ComparisonRow label="Gender" field="gender" valS={sData?.player?.gender} valT={tData?.player?.gender} />
                                    <ComparisonRow label="Email Address" field="email" valS={sData?.player?.email} valT={tData?.player?.email} />
                                    <ComparisonRow label="Phone Number" field="phoneNumber" valS={sData?.player?.phoneNumber} valT={tData?.player?.phoneNumber} />
                                    <ComparisonRow label="Birthdate" field="birthDate" valS={sData?.player?.birthDate && format(new Date(sData.player.birthDate), "PP")} valT={tData?.player?.birthDate && format(new Date(tData.player.birthDate), "PP")} />
                                    <ComparisonRow label="Full Address" field="address" valS={sData?.player?.address?.fullAddress} valT={tData?.player?.address?.fullAddress} />

                                    <ComparisonRow
                                        label="Documents"
                                        field="validDocuments"
                                        valS={sData?.player?.validDocuments}
                                        valT={tData?.player?.validDocuments}
                                        isDocs
                                    />
                                </div>
                            )}

                            <DialogFooter className="mt-8 flex items-center justify-between gap-4">
                                <Button variant="outline" onClick={() => setStep("LIST")} className="px-6 h-11 text-slate-600">Back</Button>
                                <Button disabled={merging || sLoading || tLoading} onClick={() => {
                                    const source = sData?.player;
                                    const target = tData?.player;
                                    if (!source || !target || !targetId || !sourceId) return;

                                    const mergedData = {
                                        _id: targetId,
                                        firstName: selections.firstName === sourceId ? source.firstName : target.firstName,
                                        middleName: selections.middleName === sourceId ? source.middleName : target.middleName,
                                        lastName: selections.lastName === sourceId ? source.lastName : target.lastName,
                                        suffix: selections.suffix === sourceId ? source.suffix : target.suffix,
                                        gender: selections.gender === sourceId ? source.gender : target.gender,
                                        email: selections.email === sourceId ? source.email : target.email,
                                        phoneNumber: selections.phoneNumber === sourceId ? source.phoneNumber : target.phoneNumber,
                                        birthDate: selections.birthDate === sourceId ? source.birthDate : target.birthDate,
                                        address: selections.address === sourceId ? source.address : target.address,
                                        validDocuments: selections.validDocuments === sourceId ? source.validDocuments : target.validDocuments,
                                    };

                                    const omitTypenameDeep = (obj: any): any => {
                                        if (Array.isArray(obj)) return obj.map(omitTypenameDeep);
                                        if (obj && typeof obj === 'object') {
                                            return Object.keys(obj).reduce((acc, key) => {
                                                if (key !== '__typename') {
                                                    acc[key] = omitTypenameDeep(obj[key]);
                                                }
                                                return acc;
                                            }, {} as any);
                                        }
                                        return obj;
                                    };

                                    const cleanedMergedData = omitTypenameDeep(mergedData);

                                    mergePlayers({ variables: { input: { targetPlayerId: targetId, sourcePlayerId: sourceId, mergedData: cleanedMergedData } } })
                                        .then((res: any) => {
                                            if (res.data?.mergePlayers.ok) {
                                                handleMergeSuccess(res.data);
                                            }
                                        })
                                        .catch(err => toast.error(err.message));
                                }} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[200px] h-11 font-bold text-sm shadow-lg transition-transform active:scale-95">
                                    {merging ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                                    Finalize Record Merge
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* DOCUMENT VIEWER MODAL */}
            <Dialog open={!!viewDoc} onOpenChange={(open) => !open && setViewDoc(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-800">
                            <FileText size={18} className="text-blue-500" />
                            {viewDoc?.type}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto rounded-lg border bg-slate-100 flex items-center justify-center min-h-[400px]">
                        {viewDoc?.url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                            <img src={viewDoc.url} alt={viewDoc.type} className="max-w-full h-auto shadow-sm" />
                        ) : (
                            <iframe src={viewDoc?.url} className="w-full h-[60vh]" title="Document Preview" />
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewDoc(null)}>Close Preview</Button>
                        <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
                            <a href={viewDoc?.url} target="_blank" rel="noreferrer">Open in New Tab</a>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}