"use client";

import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Plus } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";
import { prepareContractCall, sendTransaction } from "thirdweb";
import { insuranceEscrow } from "./thirdweb-button";
import { z } from "zod"
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react";
import LoadingCards from "./loading-cards";
import { sleep } from "@/lib/utils";

const schema = z.object({
    radius: z.number(),
    premium: z.number(),
    value: z.number(),
    payout: z.number(),
    latitude: z.number(),
    longitude: z.number()
})

export function InsuranceForm() {
    const [progress, setProgress] = useState<number>(-1);

    const activeAccount = useActiveAccount();

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            radius: 1000,
            premium: 1,
            value: 10,
            payout: 10,
            latitude: 0,
            longitude: 0
        },
        mode: "onChange"
    });
    form.watch();

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                form.setValue("latitude", position.coords.latitude);
                form.setValue("longitude", position.coords.longitude);
            },
            (error) => {
                alert("Unable to retrieve your location. Please enter manually.");
                console.error("Geolocation error:", error);
            }
        );
    };

    const handleSubmit = async (values: z.infer<typeof schema>) => {
        if (!activeAccount) {
            return;
        }

        setProgress(0);

        /*
        const zkAppAddress = "test";

        const transaction = prepareContractCall({
            contract: insuranceEscrow,
            method: "newInsurance",
            params: [
                activeAccount.address,
                BigInt(Math.trunc(values.premium * (10 ** 9))),
                BigInt(Math.trunc(values.payout * (10 ** 9))),
                BigInt(values.latitude * (10 ** 9)),
                BigInt(values.longitude * (10 ** 9)),
                BigInt(Math.trunc(values.radius)),
                zkAppAddress
            ],
            value: BigInt(Math.trunc(values.value * (10 ** 9)))
        });

        const { transactionHash } = await sendTransaction({
            account: activeAccount,
            transaction: transaction
        });
        */

        await sleep(270000);

        setProgress(1)
    };

    return (
        <Card className="bg-background text-foreground">
            <form onSubmit={form.handleSubmit(handleSubmit)}>  
                <CardHeader>
                    <CardTitle>Create New Contract</CardTitle>
                    <CardDescription>Set up a new insurance contract with your parameters</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="radius"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Radius</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        placeholder="500"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="premium"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Monthly Premium (FLR)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        placeholder="0.1"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="value"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contract value (FLR)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        placeholder="1000"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="payout"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Payout (FLR)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        placeholder="100"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="latitude"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Latitude</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        placeholder="40.7128"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="longitude"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Longitude</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        placeholder="-74.0060"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
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
                        </form>
                    </Form>
                </CardContent>
                <CardFooter
                    className="flex flex-col space-y-4"
                >
                    <Button
                        type="submit"
                        className="w-full relative"
                        disabled={progress > -1}
                    >
                        {progress > -1 && (
                            <span className="absolute left-1/2 -translate-x-1/2">
                                <svg
                                    className="animate-spin h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                            </span>
                        )}
                        <span className={progress > -1 ? "opacity-0" : ""}>
                            <Plus className="h-4 w-4 mr-2 inline" />
                            Create Contract
                        </span>
                    </Button>
                    <div
                        className="w-full"
                    >
                        <LoadingCards
                            cards={[
                                {
                                    name: "Deploying zkApp on Mina",
                                    estimated: 270000
                                },
                                {
                                    name: "Creating the contract on Flare",
                                    estimated: 5000
                                }
                            ]}
                            index={progress}
                        />
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}