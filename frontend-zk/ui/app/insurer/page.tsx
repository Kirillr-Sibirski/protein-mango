"use client";
import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Plus } from "lucide-react";
import InsuranceEscrow from "@/components/ABIs/InsuranceEscrow.json";
import { formatEther, parseEther } from "viem";
import { deployCoords } from "@/lib/mina";
import bs58 from "bs58";
import ZkappWorkerClient from "@/lib/zkappWorkerClient";
import ModernMultiStageLoader from "@/components/multi-stage-loader";

type Insurance = {
    receiver: `0x${string}`;
    token: `0x${string}`;
    premium: bigint;
    payout: bigint;
    x: bigint;
    y: bigint;
    radius: bigint;
    snarkId: `0x${string}`;
    value: bigint;
};

const CONTRACT_ADDRESS = "0xYourContractAddress" as const; // Flare contract

export default function InsurerPage() {
    const [progress, setProgress] = useState(-1);

    const { address } = useAccount();
    const [formData, setFormData] = useState({
        radius: "1000",
        premium: "0.01",
        totalAmount: "1",
        amountPerClaimer: "0.1",
        lat: "0",
        lng: "0"
    });

    // Read contract data
    const { data: insuranceData } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: InsuranceEscrow,
        functionName: "getInsurances",
        query: {
            refetchInterval: 3000,
        }
    });

    // Write contract function
    const { writeContract, isPending } = useWriteContract();

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    lat: position.coords.latitude.toFixed(4),
                    lng: position.coords.longitude.toFixed(4)
                }));
            },
            (error) => {
                alert("Unable to retrieve your location. Please enter manually.");
                console.error("Geolocation error:", error);
            }
        );
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleCreateContract = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address) {
            alert("Please connect your wallet");
            return;
        }

        const radiusBigInt = BigInt(Math.floor(parseFloat(formData.radius)));
        const premiumInWei = parseEther(formData.premium);
        const amountPerClaimerInWei = parseEther(formData.amountPerClaimer);
        const totalAmountInWei = parseEther(formData.totalAmount);
        const latitudeBigInt = BigInt(Math.floor(parseFloat(formData.lat) * 1e6));
        const longitudeBigInt = BigInt(Math.floor(parseFloat(formData.lng) * 1e6));

        setProgress(0);

        let minaAppAddress;
        try {
            minaAppAddress = await (new ZkappWorkerClient()).deployCoords(
                latitudeBigInt,
                longitudeBigInt,
                radiusBigInt
            );
        } catch (error) {
            console.error(error);
        }
        if (!minaAppAddress) {
            console.error("Failed to deploy Mina zkApp");
            setProgress(-1);
            return;
        }

        setProgress(1);

        try {
            // Convert Mina address to bytes32 for Ethereum
            const decoded = bs58.decode(minaAppAddress);
            const snarkId = `0x${Buffer.from(decoded).toString('hex').slice(0, 64)}` as `0x${string}`;

            // Create insurance contract with native token value
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: InsuranceEscrow,
                functionName: "newInsurance",
                args: [
                    address,
                    premiumInWei,
                    amountPerClaimerInWei,
                    latitudeBigInt,
                    longitudeBigInt,
                    radiusBigInt,
                    snarkId
                ],
                value: totalAmountInWei // Native token value
            });

            setFormData({
                radius: "",
                premium: "",
                totalAmount: "",
                amountPerClaimer: "",
                lat: "",
                lng: ""
            });

        } catch (error) {
            console.error("Error creating contract:", error);
            alert("Error creating contract. Please check the console for details.");
        }
    };

    const insuranceList = (insuranceData as Insurance[]) || [];

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Active Contracts */}
                <div className="lg:col-span-1">
                    <section className="mb-8">
                        <h2 className="text-3xl font-bold mb-6">Active Contracts</h2>
                        {insuranceList.length === 0 ? (
                            <div className="text-muted-foreground">No open contracts</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {insuranceList.map((insurance, index) => (
                                    <Card key={index} className="bg-background text-foreground">
                                        <CardHeader>
                                            <CardTitle>Contract #{index + 1}</CardTitle>
                                            <CardDescription>Active Insurance Contract</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {/* Contract details rendering */}
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Radius:</span>
                                                    <span>{insurance.radius.toString()}m</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Premium:</span>
                                                    <span>{formatEther(insurance.premium)} FLR</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Total Amount:</span>
                                                    <span>{formatEther(insurance.value)} FLR</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Per Claimer:</span>
                                                    <span>{formatEther(insurance.payout)} FLR</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>
                                                        {(Number(insurance.x) / 1e6).toFixed(4)},
                                                        {(Number(insurance.y) / 1e6).toFixed(4)}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column - Create Contract Form */}
                <div className="lg:col-span-2">
                    <Card className="bg-background text-foreground">
                        <form onSubmit={handleCreateContract}>  {/* Move form tag here */}
                            <CardHeader>
                                <CardTitle>Create New Contract</CardTitle>
                                <CardDescription>Set up a new insurance contract with your parameters</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="radius">Coverage radius (meters)</Label>
                                            <Input
                                                id="radius"
                                                type="number"
                                                placeholder="500"
                                                value={formData.radius}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="premium">Monthly premium (FLR)</Label>
                                            <Input
                                                id="premium"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.1"
                                                value={formData.premium}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="totalAmount">Total value (FLR)</Label>
                                            <Input
                                                id="totalAmount"
                                                type="number"
                                                step="0.1"
                                                placeholder="1000"
                                                value={formData.totalAmount}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="amountPerClaimer">Claim payout (FLR)</Label>
                                            <Input
                                                id="amountPerClaimer"
                                                type="number"
                                                step="0.1"
                                                placeholder="100"
                                                value={formData.amountPerClaimer}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="lat">Latitude</Label>
                                            <Input
                                                id="lat"
                                                type="number"
                                                step="0.0001"
                                                placeholder="40.7128"
                                                value={formData.lat}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lng">Longitude</Label>
                                            <Input
                                                id="lng"
                                                type="number"
                                                step="0.0001"
                                                placeholder="-74.0060"
                                                value={formData.lng}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full"
                                                onClick={handleGetLocation}
                                            >
                                                <MapPin className="h-4 w-4 mr-2" />
                                                Use Current Location
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter
                                className="flex flex-col space-y-4"
                            >
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <span>Creating...</span>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Contract
                                        </>
                                    )}
                                </Button>
                                <div
                                    className="w-full"
                                >
                                    <ModernMultiStageLoader
                                        stageIndex={progress}
                                    />
                                </div>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}