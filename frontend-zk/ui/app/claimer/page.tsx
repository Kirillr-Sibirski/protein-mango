"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Contract = {
    id: number;
    insurer: string;
    radius: string;
    premium: string;
    totalAmount: string;
    amountPerClaimer: string;
    location: { lat: number; lng: number };
};

export default function ClaimerPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [coordinates, setCoordinates] = useState({ lat: "", lng: "" });

    const [userContracts] = useState<Contract[]>([
        {
            id: 1,
            insurer: "0x123...abc",
            radius: "500",
            premium: "0.1",
            totalAmount: "1000",
            amountPerClaimer: "100",
            location: { lat: 40.7128, lng: -74.0060 }
        },
    ]);

    const [availableContracts] = useState<Contract[]>([
        {
            id: 1,
            insurer: "0x123...abc",
            radius: "500",
            premium: "0.1",
            totalAmount: "1000",
            amountPerClaimer: "100",
            location: { lat: 40.7128, lng: -74.0060 }
        },
        {
            id: 2,
            insurer: "0x456...def",
            radius: "1000",
            premium: "0.2",
            totalAmount: "2000",
            amountPerClaimer: "200",
            location: { lat: 34.0522, lng: -118.2437 }
        },
    ]);

    const columns: ColumnDef<Contract>[] = [
        {
            accessorKey: "id",
            header: "Contract ID",
        },
        {
            accessorKey: "insurer",
            header: "Insurer",
        },
        {
            accessorKey: "radius",
            header: "Radius (m)",
        },
        {
            accessorKey: "amountPerClaimer",
            header: "Claim Amount (ETH)",
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
            cell: ({ row }) => {
                return (
                    <Button
                        variant="outline"
                        onClick={() => {
                            handleSignContract(row.id)
                        }}
                    >
                        Sign This Contract
                    </Button>
                );
            },
        },
    ];

    const table = useReactTable({
        data: availableContracts,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            globalFilter: searchQuery,
        },
        onGlobalFilterChange: setSearchQuery,
    });

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoordinates({
                        lat: position.coords.latitude.toFixed(6),
                        lng: position.coords.longitude.toFixed(6),
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    };

    const handleClaim = (contractId: any) => {
        console.log("Claiming contract:", contractId);
        // TODO: Mint Mina ZK proof
    };

    const handlePremium = (contractId: any) => {
        console.log("Claiming contract:", contractId);
        // TODO: Add claim logic
    };

    const handleSignContract = (contractId: any) => {
        console.log("Creating contract:", contractId);
        // TODO: Add contract creation logic - call Flare function
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - User Contracts */}
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
                                            <CardTitle>Contract #{contract.id}</CardTitle>
                                            <div className="text-sm text-muted-foreground">
                                                Insurer: {contract.insurer}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Claim Amount:</span>
                                                <span>{contract.amountPerClaimer} ETH</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button
                                                onClick={() => handlePremium(contract.id)}
                                                className="w-full"
                                            >
                                                Pay the Premium
                                            </Button>
                                            <Button
                                                onClick={() => handleClaim(contract.id)}
                                                className="w-full"
                                            >
                                                Claim Now
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column - Available Contracts */}
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
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                data-state={row.getIsSelected() && "selected"}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length}
                                                className="h-24 text-center"
                                            >
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