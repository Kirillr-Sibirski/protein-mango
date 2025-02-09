"use client";

import { useState, useEffect } from "react";
import { InsuranceForm } from "@/components/insurance-form";
import { insuranceEscrow } from "@/components/thirdweb-button";
import { Card, CardHeader, CardTitle, CardFooter, CardDescription, CardContent } from "@/components/ui/card";
import { MapPin, Search } from "lucide-react";
import { toEther, sendAndConfirmTransaction, prepareTransaction, toWei, prepareContractCall, sendTransaction } from "thirdweb";
import { useActiveAccount, useReadContract } from "thirdweb/react";
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

interface UserInsurance {
    id: bigint;
    expiryTimestamp: bigint;
}

interface InsuranceDisplay {
    id: number;
    receiver: string;
    payoutAmount: string;
    location: { lat: number; lng: number };
    premiumPaid: boolean;
    premiumExpires: number;
}

export default function ClaimerPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isClaiming, setIsClaiming] = useState(false);
    const [availableContracts, setAvailableContracts] = useState<InsuranceDisplay[]>([]);
    const [userContracts, setUserContracts] = useState<InsuranceDisplay[]>([]);
    const wallet = useActiveAccount();

    // Fetch raw insurances from the contract
    const { data: rawInsurances } = useReadContract({
        contract: insuranceEscrow,
        method: "getInsurances",
    }) as { data: ContractInsurance[] | undefined };

    const { data: userInsurances } = useReadContract({
        contract: insuranceEscrow,
        method: "getInsurancesByUser",
        params: [wallet?.address ?? ""]
    }) as { data: UserInsurance[] | undefined };

    useEffect(() => {
        async function fetchInsurances() {
            if (!rawInsurances || !userInsurances || !wallet) return;

            const currentTime = Date.now() / 1000; // Unix timestamp in seconds
            
            // Create a map of user insurance IDs to expiry timestamps
            const userInsuranceMap = new Map(
                userInsurances.map(insurance => [
                    Number(insurance.id),
                    Number(insurance.expiryTimestamp)
                ])
            );

            // Process all insurances
            const processed: InsuranceDisplay[] = rawInsurances.map((insurance, idx) => {
                const expiryTimestamp = userInsuranceMap.get(idx) || 0;
                const premiumPaid = expiryTimestamp > currentTime;

                return {
                    id: idx,
                    receiver: insurance.receiver,
                    payoutAmount: toEther(insurance.payout),
                    location: {
                        lat: Number(insurance.lat) / 1e6,
                        lng: Number(insurance.long) / 1e6,
                    },
                    premiumPaid,
                    premiumExpires: expiryTimestamp,
                };
            });

            // Split into available and user contracts
            setAvailableContracts(processed.filter(item => !item.premiumPaid));
            setUserContracts(processed.filter(item => 
                userInsuranceMap.has(item.id) && userInsuranceMap.get(item.id)! > currentTime
            ));
        }

        fetchInsurances();
    }, [rawInsurances, userInsurances, wallet]);

    const handlePayPremium = async (insuranceId: number) => {
        try {
            console.log("Pay premium", insuranceId);
        } catch (error) {
            console.error("Error paying premium:", error);
        }
    };

    const handeClaim = async (insuranceId: number) => {
        try {
            setIsClaiming(true);
            
            const minaDataResponse = await prepareCoordsFdcRequest(insuranceEscrow.address, wallet!.address);
            const quakeDataResponse = await prepareDisasterFdcRequest();

            if (!minaDataResponse || !quakeDataResponse) {
                throw new Error("Failed to prepare FDC requests");
            }

            const minaData = {
                merkleProof: [] as readonly `0x${string}`[],
                data: JSON.parse(minaDataResponse)
            };

            const quakeData = {
                merkleProof: [] as readonly `0x${string}`[],
                data: JSON.parse(quakeDataResponse)
            };

            const transaction = prepareContractCall({
                contract: insuranceEscrow,
                method: "requestPayout",
                params: [
                    minaData,
                    quakeData,
                    BigInt(insuranceId)
                ]
            });

            const { transactionHash } = await sendTransaction({
                account: wallet!,
                transaction: transaction
            });

            console.log("Claim successful:", transactionHash);
        } catch (error) {
            console.error("Error claiming insurance:", error);
        } finally {
            setIsClaiming(false);
        }
    };

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
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">Payout Amount:</span>
                                                <span>{contract.payoutAmount} ETH</span>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handeClaim(contract.id)}
                                                    disabled={isClaiming}
                                                >
                                                    {isClaiming ? "Claiming..." : "Claim"}
                                                </Button>
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