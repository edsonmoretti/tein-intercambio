import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import femaleNames from "@/data/female-names.json";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isFemaleName(name: string | null | undefined): boolean {
    if (!name) return false;
    // Normalize to handle accents if needed, but the list has accents.
    // We just take the first name.
    const firstName = name.trim().split(' ')[0];

    // Create a Set for faster lookup, normalize to uppercase for case-insensitive comparison
    // We do this inside to ensure fresh data, but optimally could be outside if static.
    // For now, this is fine.
    const femaleSet = new Set(femaleNames.map(n => n.toUpperCase()));

    return femaleSet.has(firstName.toUpperCase());
}

export function getGenderColor(name: string | null | undefined, defaultColor: string = "text-slate-900 dark:text-white"): string {
    if (isFemaleName(name)) {
        return "text-pink-600 dark:text-pink-400"; // Rosado
    }
    return defaultColor;
}

export function getGenderBg(name: string | null | undefined, defaultBg: string = ""): string {
    if (isFemaleName(name)) {
        return "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-300 dark:border-pink-800";
    }
    return defaultBg;
}
