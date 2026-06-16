export declare const TALENT_CATEGORIES: readonly ["Acting", "Art", "Beauty", "Comedy", "Cooking", "Dance", "DJ", "Education", "Fashion", "Film", "Fitness", "Gaming", "Modeling", "Music", "Photography", "Singing", "Spoken Word", "Sports", "Technology", "Travel", "Writing"];
export type TalentCategory = typeof TALENT_CATEGORIES[number];
export declare function isValidCategory(category: string): category is TalentCategory;
export declare function filterValidCategories(categories: string[]): TalentCategory[];
