import { redirect } from "next/navigation";

export default function CatchAllEmployeeRedirect() {
  redirect("/dashboard/employee");
}
