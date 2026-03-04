export const TODO_CATEGORIES = [
  { id: "personal", label: "category_personal", icon: "person-outline" },
  { id: "work", label: "category_work", icon: "briefcase-outline" },
  { id: "home", label: "category_home", icon: "home-outline" },
  { id: "family", label: "category_family", icon: "people-circle-outline" },
  { id: "health", label: "category_health", icon: "medkit-outline" },
  { id: "dev", label: "category_dev", icon: "bulb-outline" },
  { id: "sport", label: "category_sport", icon: "barbell-outline" },
  { id: "car", label: "category_car", icon: "car-outline" },
] as const;

export type TodoCategoryId = (typeof TODO_CATEGORIES)[number]["id"];
