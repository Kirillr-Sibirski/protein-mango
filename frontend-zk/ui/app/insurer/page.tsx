"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Plus } from "lucide-react";

export default function InsurerPage() {
    const [formData, setFormData] = useState({
        radius: "",
        premium: "",
        totalAmount: "",
        amountPerClaimer: "",
        lat: "",
        lng: ""
    });

    const [contracts, setContracts] = useState([
        {
            id: 1,
            radius: "500",
            premium: "0.1",
            totalAmount: "1000",
            amountPerClaimer: "100",
            location: { lat: 40.7128, lng: -74.0060 },
            active: true
        },
    ]);

    const handleInputChange = (e: any) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleCreateContract = async (e: any) => {
        e.preventDefault();
        if (!formData.lat || !formData.lng) {
            alert("Please enter valid coordinates.");
            return;
        }

        const contractData = {
            ...formData,
            location: { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) }
        };

        // TODO: INTEGRATE FLARE HERE

        console.log("Creating new contract with data:", contractData);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Active Contracts */}
                <div className="lg:col-span-1">
                    <section className="mb-8">
                        <h2 className="text-3xl font-bold mb-6">Active Contracts</h2>
                        {contracts.length === 0 ? (
                            <div className="text-muted-foreground">No open contracts</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {contracts.map((contract) => (
                                    <Card key={contract.id} className="bg-background text-foreground">
                                        <CardHeader>
                                            <CardTitle>Contract #{contract.id}</CardTitle>
                                            <CardDescription>Active Insurance Contract</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Radius:</span>
                                                    <span>{contract.radius}m</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Daily Premium:</span>
                                                    <span>{contract.premium} ETH</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Total Amount:</span>
                                                    <span>{contract.totalAmount} ETH</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Per Claimer:</span>
                                                    <span>{contract.amountPerClaimer} ETH</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>
                                                        {contract.location.lat.toFixed(4)}, {contract.location.lng.toFixed(4)}
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
                        <CardHeader>
                            <CardTitle>Create New Contract</CardTitle>
                            <CardDescription>Set up a new insurance contract with your parameters</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateContract} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="radius">Coverage Radius (meters)</Label>
                                            <Input id="radius" type="number" placeholder="500" value={formData.radius} onChange={handleInputChange} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="premium">Daily Premium (ETH)</Label>
                                            <Input id="premium" type="number" step="0.01" placeholder="0.1" value={formData.premium} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="totalAmount">Total Amount (ETH)</Label>
                                            <Input id="totalAmount" type="number" step="0.1" placeholder="1000" value={formData.totalAmount} onChange={handleInputChange} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="amountPerClaimer">Amount per Claimer (ETH)</Label>
                                            <Input id="amountPerClaimer" type="number" step="0.1" placeholder="100" value={formData.amountPerClaimer} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="lat">Latitude</Label>
                                            <Input id="lat" type="number" step="0.0001" placeholder="40.7128" value={formData.lat} onChange={handleInputChange} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lng">Longitude</Label>
                                            <Input id="lng" type="number" step="0.0001" placeholder="-74.0060" value={formData.lng} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleCreateContract} className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Contract
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}