import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { KidProfile } from "@/lib/types";

export function useKidProfiles() {
  const { user } = useAuth();
  const [kids, setKids] = useState<KidProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKids = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("kid_profiles")
      .select("*")
      .eq("user_id", user.id);

    if (data && data.length > 0) {
      setKids(
        data.map((k: any) => ({
          name: k.name,
          age: k.age,
          allergies: k.allergies || [],
          dislikes: k.dislikes || [],
          favorites: k.favorites || [],
          dietType: k.diet_type,
        }))
      );
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchKids();
  }, [fetchKids]);

  const saveKids = async (newKids: KidProfile[]) => {
    if (!user) return;
    // Delete existing and re-insert
    await supabase.from("kid_profiles").delete().eq("user_id", user.id);
    const rows = newKids.map((k) => ({
      user_id: user.id,
      name: k.name,
      age: k.age,
      allergies: k.allergies,
      dislikes: k.dislikes,
      favorites: k.favorites,
      diet_type: k.dietType,
    }));
    await supabase.from("kid_profiles").insert(rows);
    setKids(newKids);
  };

  return { kids, loading, saveKids, refetch: fetchKids, hasKids: kids.length > 0 };
}
