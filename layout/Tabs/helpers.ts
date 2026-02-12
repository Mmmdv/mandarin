import { Ionicons } from "@expo/vector-icons";

export const getIconName = (routeName: string, isFocused: boolean): keyof typeof Ionicons.glyphMap => {
    switch (routeName) {
        case "index": return isFocused ? "home" : "home-outline";
        case "todo": return isFocused ? "list" : "list-outline";
        case "birthday": return isFocused ? "gift" : "gift-outline";
        case "shopping": return isFocused ? "cart" : "cart-outline";
        case "events": return isFocused ? "ticket" : "ticket-outline";
        case "movies": return isFocused ? "film" : "film-outline";
        case "expenses": return isFocused ? "wallet" : "wallet-outline";
        default: return "ellipse-outline";
    }
};

export const getLabelName = (routeName: string, t: (key: any) => string): string => {
    switch (routeName) {
        case "index": return t("tab_home");
        case "todo": return t("tab_todo");
        case "birthday": return t("tab_birthday");
        case "shopping": return t("tab_shopping");
        case "events": return t("tab_events");
        case "movies": return t("tab_movies");
        case "expenses": return t("tab_expenses");
        default: return "";
    }
};

export const generateSideItems = (routes: any[], count: number, reverse: boolean = false) => {
    const items = [];
    for (let i = 0; i < count; i++) {
        const index = reverse ? (routes.length - 1 - (i % routes.length)) : (i % routes.length);
        items.push(routes[index]);
    }
    return reverse ? items.reverse() : items;
};
