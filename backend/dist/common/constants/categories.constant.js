"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TALENT_CATEGORIES = void 0;
exports.isValidCategory = isValidCategory;
exports.filterValidCategories = filterValidCategories;
exports.TALENT_CATEGORIES = [
    "Acting",
    "Art",
    "Beauty",
    "Comedy",
    "Cooking",
    "Dance",
    "DJ",
    "Education",
    "Fashion",
    "Film",
    "Fitness",
    "Gaming",
    "Modeling",
    "Music",
    "Photography",
    "Singing",
    "Spoken Word",
    "Sports",
    "Technology",
    "Travel",
    "Writing",
];
function isValidCategory(category) {
    return exports.TALENT_CATEGORIES.includes(category);
}
function filterValidCategories(categories) {
    return categories.filter(isValidCategory);
}
//# sourceMappingURL=categories.constant.js.map