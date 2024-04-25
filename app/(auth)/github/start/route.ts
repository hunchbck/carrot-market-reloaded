import { redirect } from "next/navigation";
import { socialStart } from "@/lib/social";

export function GET() {
  return redirect(socialStart("github"));
};