import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/coaches/groups/$groupId")({
  component: () => <Outlet />,
});