import { redirect } from "next/navigation";

export default function CatchAllManagerRedirect() {
  redirect("/dashboard/manager");
}
