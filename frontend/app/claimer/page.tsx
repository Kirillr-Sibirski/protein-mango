"use client";

import { useState, useEffect } from "react";
import { InsuranceForm } from "@/components/insurance-form";
import { insuranceEscrow } from "@/components/thirdweb-button";
import { Card, CardHeader, CardTitle, CardFooter, CardDescription, CardContent } from "@/components/ui/card";
import { MapPin, Search } from "lucide-react";
import { toEther } from "thirdweb";
import { useActiveAccount, useReadContract, useSendAndConfirmTransaction } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
    prepareCoordsFdcRequest, prepareDisasterFdcRequest
} from "@/lib/flare";
import { useActiveWallet } from "thirdweb/react";

const CONTRACT_ADDRESS = "0x5B4eBf8e7f0F4B2bCfBb0F1CfBb0F1CfBb0F1CfB";

interface ContractInsurance {
    receiver: string;
    premium: bigint;
    payout: bigint;
    long: bigint;
    lat: bigint;
    radius: bigint;
    snarkId: string;
    value: bigint;
}

interface InsuranceDisplay {
    id: number;
    receiver: string;
    payoutAmount: string;
    location: { lat: number; lng: number };
    premiumPaid: boolean;
    premiumExpires: number;
    // you can add any additional fields needed for display here
}

export default function ClaimerPage() {
    // State for search query, contract statuses, etc.
    const [searchQuery, setSearchQuery] = useState("");
    const [isClaiming, setIsClaiming] = useState(false);
    const [availableContracts, setAvailableContracts] = useState<InsuranceDisplay[]>([]);
    const [userContracts, setUserContracts] = useState<InsuranceDisplay[]>([]);

    // Fetch raw insurances from the contract
    const { data: rawInsurances } = useReadContract({
        contract: insuranceEscrow,
        method: "getInsurances",
    }) as { data: ContractInsurance[] | undefined };

    // Get the user's wallet address
    const wallet = useActiveAccount();

    // Remove the previous premiumTimestamps useReadContract hook (since we now fetch per insurance)

    // Once rawInsurances and address are available, batch fetch each premium timestamp.
    useEffect(() => {
        async function fetchPremiums() {
            if (!rawInsurances || !wallet) return;
            // Process each insurance contract
            const processed: InsuranceDisplay[] = await Promise.all(
                rawInsurances.map(async (insurance, idx) => {
                    // Call getPremiumTimestamp for each insurance id and the user's address.
                    // Using the SDK (assumes insuranceEscrow exposes a read method)
                    let timestamp = 0;
                    try {
                        // Note: adapt the following as required by your Thirdweb contract call mechanism
                        const { data: timestamp } = useReadContract({
                            contract: insuranceEscrow,
                            method: "getPremiumTimestamp",
                            params: [BigInt(idx), wallet.address],
                        });
                        // timestamp here is a number representing when premium was paid
                    } catch (error) {
                        console.error(`Error fetching premium timestamp for insurance ${idx}:`, error);
                    }
                    const premiumPaid = timestamp > 0;
                    const premiumExpires = premiumPaid ? Number(timestamp) + 30 * 86400 : 0;
                    return {
                        id: idx,
                        receiver: insurance.receiver,
                        payoutAmount: toEther(insurance.payout),
                        location: {
                            lat: Number(insurance.lat) / 1e6,
                            lng: Number(insurance.long) / 1e6,
                        },
                        premiumPaid,
                        premiumExpires,
                    };
                })
            );
            // Separate into available insurances vs active contracts
            setAvailableContracts(processed.filter((item) => !item.premiumPaid));
            // For active contracts, also check that premium isn't expired, using the current time from the trusted source.
            const currentTime = Date.now() / 1000; // Unix timestamp in seconds
            setUserContracts(
                processed.filter(
                    (item) => item.premiumPaid && item.premiumExpires > currentTime
                )
            );
        }
        fetchPremiums();
    }, [rawInsurances, wallet]);

    // Function to pay premium for a selected insurance
    // Ensure that the premium amount (from contract) is sent as msg.value etc.
    //const { writeContract: payPremium } = useWriteContract(); // TODO: useSendAndConfirmTransaction()
    const handlePayPremium = async (insuranceId: number) => {
        try {
            // await payPremium({
            //     address: CONTRACT_ADDRESS,
            //     abi: insuranceEscrow,
            //     functionName: "payPremium",
            //     args: [insuranceId],
            //     // Optionally include value if needed, e.g., msg.value should match the premium in the contract
            // });
            // After paying premium, refresh the premium status of contracts, e.g. by refetching insurances.
        } catch (error) {
            console.error("Error paying premium:", error);
        }
    };

    // Configure Tanstack table columns for available contracts.
    const columns: ColumnDef<InsuranceDisplay>[] = [
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
                {/* Left Column: Active Contracts */}
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
                                                Valid until:{" "}
                                                {new Date(contract.premiumExpires * 1000).toLocaleDateString()}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Payout Amount:</span>
                                                <span>{contract.payoutAmount} ETH</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column: Available Insurance Contracts */}
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