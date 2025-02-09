"use client";
import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, AlertCircle, Search } from "lucide-react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import InsuranceEscrow from "@/components/ABIs/InsuranceEscrow.json";
import { formatEther, parseEther } from "viem";
import {
    verifyCoords
} from "@/lib/mina";

const CONTRACT_ADDRESS = "0xYourContractAddress"; // Flare contract

type Insurance = {
    id: number;
    receiver: string;
    premiumPaid: boolean;
    premiumExpires: number;
    payoutAmount: string;
    location: { lat: number; lng: number };
};

export default function ClaimerPage() {
    type PremiumTimestamps = Record<number, Record<string, number>>;
    const { address } = useAccount();
    const [searchQuery, setSearchQuery] = useState("");
    const [isClaiming, setIsClaiming] = useState(false);

    // Read all insurance contracts from blockchain
    const { data: rawInsurances } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: InsuranceEscrow,
        functionName: "getInsurances",
    });

    const { data: premiumTimestamps } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: InsuranceEscrow,
        functionName: "getPremiumTimestamp",
        args: [address], // Ensure this matches your contract's requirements
    });

    // Cast the data to the correct type
    const premiumData = premiumTimestamps as PremiumTimestamps | undefined;

    // Process insurance data
    const [availableContracts, setAvailableContracts] = useState<Insurance[]>([]);
    const [userContracts, setUserContracts] = useState<Insurance[]>([]);

    useEffect(() => {
        if (rawInsurances && premiumData) {
            const processed = (rawInsurances as any[]).map((insurance, id) => {
                // Access the nested mapping correctly
                const timestamp = premiumData[id]?.[address!] || 0;
                return {
                    id,
                    receiver: insurance.receiver,
                    payoutAmount: formatEther(insurance.payout),
                    location: {
                        lat: Number(insurance.x) / 1e6,
                        lng: Number(insurance.y) / 1e6,
                    },
                    premiumPaid: timestamp > 0,
                    premiumExpires: timestamp + 30 * 86400,
                };
            });

            setAvailableContracts(processed);
            setUserContracts(
                processed.filter(
                    (contract) =>
                        contract.premiumPaid && contract.premiumExpires > Date.now() / 1000
                )
            );
        }
    }, [rawInsurances, premiumData, address]);

    // Contract interactions
    const { writeContract: payPremium } = useWriteContract();
    const { writeContract: requestPayout } = useWriteContract();

    const handlePayPremium = (insuranceId: number) => {
        payPremium({
            address: CONTRACT_ADDRESS,
            abi: InsuranceEscrow,
            functionName: "payPremium",
            args: [insuranceId],
        });
    };

    const handleClaim = async (insuranceId: number) => {
        setIsClaiming(true);
        try {
            // TODO: Call verifyCoords in mina.ts
            await requestPayout({
                address: CONTRACT_ADDRESS,
                abi: InsuranceEscrow,
                functionName: "requestPayout",
                args: [insuranceId],
            });
        } finally {
            setIsClaiming(false);
        }
    };

    // Table configuration
    const columns: ColumnDef<Insurance>[] = [
        {
            accessorKey: "id",
            header: "Insurance ID",
        },
        {
            accessorKey: "payoutAmount",
            header: "Payout Amount (ETH)",
        },
        {
            accessorKey: "location",
            header: "Location",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {row.original.location.lat.toFixed(4)}, {row.original.location.lng.toFixed(4)}
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <Button
                    variant="outline"
                    onClick={() => handlePayPremium(row.original.id)}
                    disabled={row.original.premiumPaid}
                >
                    {row.original.premiumPaid ? "Premium Paid" : "Pay Premium"}
                </Button>
            ),
        },
    ];

    const table = useReactTable({
        data: availableContracts,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter: searchQuery },
        onGlobalFilterChange: setSearchQuery,
    });

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* My Active Contracts */}
                <div className="lg:col-span-1">
                    <section className="mb-8">
                        <h2 className="text-3xl font-bold mb-6">My Contracts</h2>
                        {userContracts.length === 0 ? (
                            <div className="text-muted-foreground">No active contracts</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {userContracts.map((contract) => (
                                    <Card key={contract.id} className="bg-background text-foreground">
                                        <CardHeader>
                                            <CardTitle>Insurance #{contract.id}</CardTitle>
                                            <div className="text-sm text-muted-foreground">
                                                Valid until: {new Date(contract.premiumExpires * 1000).toLocaleDateString()}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Payout Amount:</span>
                                                <span>{contract.payoutAmount} ETH</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button
                                                onClick={() => handleClaim(contract.id)}
                                                className="w-full"
                                                disabled={contract.premiumExpires < Date.now() / 1000 || isClaiming}
                                            >
                                                {isClaiming ? "Verifying..." :
                                                    contract.premiumExpires < Date.now() / 1000 ? "Expired" : "Claim Now"}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Available Contracts */}
                <div className="lg:col-span-2">
                    <Card className="bg-background text-foreground">
                        <CardHeader>
                            <CardTitle>Available Insurance Contracts</CardTitle>
                            <div className="flex flex-col md:flex-row gap-4 pt-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search contracts..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id}>
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                                No results.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}