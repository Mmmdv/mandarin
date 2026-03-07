import TodayTasksAgenda from "@/components/features/today/TodayTasksAgenda";
import GestureWrapper from "@/components/layout/GestureWrapper";
import React from "react";

export default function TodayTasksScreen() {
  return (
    <GestureWrapper>
      <TodayTasksAgenda />
    </GestureWrapper>
  );
}
