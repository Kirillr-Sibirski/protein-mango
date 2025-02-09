import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function toHex(data: string) {
	var result = "";
	for (var i = 0; i < data.length; i++) {
		result += data.charCodeAt(i).toString(16);
	}
	return "0x" + result.padEnd(64, "0");
}

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
