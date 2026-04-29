import { redirect } from "next/navigation";

export default function FundPage() {
  redirect("/user/wallet?fund=true");
}
