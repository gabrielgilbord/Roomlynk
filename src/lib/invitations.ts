import { createClient } from "@/lib/supabase/server";

export interface InvitationPublicData {
  invitation_id: string;
  token: string;
  email: string | null;
  expires_at: string;
  room_id: string;
  room_name: string;
  monthly_rent: number;
  deposit: number;
  property_name: string;
  property_address: string;
  property_city: string;
  contract_id: string;
  contract_status: string;
  template_html: string;
  template_type: string;
  casero_name: string;
  casero_dni: string;
  start_date: string;
  end_date: string;
}

export async function fetchInvitationByToken(
  token: string
): Promise<InvitationPublicData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("fetch_invitation_by_token", {
    p_token: token,
  });

  if (error || !data) return null;
  return data as InvitationPublicData;
}
