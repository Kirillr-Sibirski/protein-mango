"use client";

import { InsuranceForm } from "@/components/insurance-form";
import { insuranceEscrow } from "@/components/thirdweb-button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { toEther } from "thirdweb";
import { useReadContract } from "thirdweb/react";

export default function Home() {
	const { data: insurances } = useReadContract({
		contract: insuranceEscrow,
		method: "getInsurances",
	});

	return (
		<div className="container mx-auto px-4 py-8 min-h-screen">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-1">
					<section className="mb-8">
						<h2 className="text-3xl font-bold mb-6">Active Contracts</h2>
						{!insurances || insurances.length === 0 ? (
							<div className="text-muted-foreground">No open contracts</div>
						) : (
							<div className="grid grid-cols-1 gap-6">
								{insurances.map((insurance, index) => (
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
													<span>{toEther(insurance.premium)} FLR</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Total Amount:</span>
													<span>{toEther(insurance.value)} FLR</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Per Claimer:</span>
													<span>{toEther(insurance.payout)} FLR</span>
												</div>
												<div className="flex items-center gap-2 text-muted-foreground">
													<MapPin className="h-4 w-4" />
													<span>
														{(Number(insurance.lat) / 1e6).toFixed(4)},
														{(Number(insurance.long) / 1e6).toFixed(4)}
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
				<div className="lg:col-span-2">
					<InsuranceForm />
				</div>
			</div>
		</div>
	);
}
