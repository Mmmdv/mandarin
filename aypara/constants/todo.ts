export const TODO_CATEGORIES = [
  {
    id: "personal",
    label: "category_personal",
    icon: "person-outline",
    color: "#3B5BDB",
  },
  {
    id: "work",
    label: "category_work",
    icon: "briefcase-outline",
    color: "#E8590C",
  },
  {
    id: "home",
    label: "category_home",
    icon: "home-outline",
    color: "#0891B2",
  },
  {
    id: "family",
    label: "category_family",
    icon: "people-circle-outline",
    color: "#C2255C",
  },
  {
    id: "health",
    label: "category_health",
    icon: "medkit-outline",
    color: "#2F9E44",
  },
  { id: "dev", label: "category_dev", icon: "bulb-outline", color: "#7048E8" },
  {
    id: "sport",
    label: "category_sport",
    icon: "barbell-outline",
    color: "#1971C2",
  },
  { id: "car", label: "category_car", icon: "car-outline", color: "#495057" },
] as const;

export type TodoCategoryId = (typeof TODO_CATEGORIES)[number]["id"];
