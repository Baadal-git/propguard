import { createClient }  from "@/lib/supabase/server";
import FirmsTable        from "@/components/admin/FirmsTable";
import type { PropFirm } from "@/types";

export default async function AdminPage() {
  const supabase = createClient();

  const { data: firms } = await supabase
    .from("prop_firms")
    .select("*")
    .eq("is_archived", false)
    .order("name", { ascending: true });

  return (
    <div className="px-8 py-8 max-w-[1200px] mx-auto">
      <FirmsTable initialFirms={(firms ?? []) as PropFirm[]} />
    </div>
  );
}
