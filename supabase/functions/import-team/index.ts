import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { teamId } = await req.json();
    
    if (!teamId) {
      throw new Error("teamId is required");
    }

    console.log(`Fetching team ${teamId} from HCUnits API`);

    // Fetch team data from HCUnits API
    const response = await fetch(`https://hcunits.net/api/v1/teams/${teamId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch team: ${response.statusText}`);
    }

    const teamData = await response.json();
    console.log("Team data received:", teamData);

    // Transform the data to match our format
    const units = teamData.units?.map((unit: any) => ({
      collection: unit.set_id,
      number: unit.collector_number || unit.number || "000",
      name: unit.name,
      points: unit.point_value || unit.points || 0,
    })) || [];

    return new Response(
      JSON.stringify({
        name: teamData.name || "Imported Team",
        units,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error("Error importing team:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});