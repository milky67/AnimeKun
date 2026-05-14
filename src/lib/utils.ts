import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: any, id?: string): string {
  if (!score || score === 'N/A' || score === '0' || score === 0) {
    if (!id) return '8.5';
    // Deterministic random score based on ID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0;
    }
    const offset = Math.abs(hash % 15) / 10; // 0.0 to 1.4
    return (7.8 + offset).toFixed(1); // 7.8 to 9.2
  }
  return String(score);
}

export function formatYear(year: any): string {
  if (!year || year === 'N/A') return '2024';
  return String(year);
}

export function getBreadcrumbSchema(items: { name: string, item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://animehubplus.netlify.app${item.item}`
    }))
  };
}
