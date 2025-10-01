import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { telefone, email, nombre } = await req.json();
    
    const apiKey = Deno.env.get('GOOGLE_SHEETS_API_KEY');
    const sheetId = '1WeIPDOTFkm748yEJBkNvWvG2MJHJJpdaJAeen1fFzIk'; // User-provided sheet ID
    const range = 'usuarios!A:C'; // Columns: A=Telefone, B=Email, C=Nombre
    
    if (!apiKey) {
      throw new Error('Google Sheets API key not configured');
    }

    // Add user to Google Sheets (sanitize phone and ensure '56' prefix)
    const phoneDigits = String(telefone || '').replace(/\D/g, '');
    const normalizedPhone = phoneDigits.startsWith('56')
      ? phoneDigits
      : (phoneDigits.startsWith('9') ? `56${phoneDigits}` : `56${phoneDigits.replace(/^0+/, '')}`);

    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=RAW&key=${apiKey}`;
    
    const response = await fetch(sheetsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [[normalizedPhone, email || '', nombre || 'Sin nombre']]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Google Sheets API error:', error);
      throw new Error(`Failed to add user to sheets: ${error}`);
    }

    const result = await response.json();
    console.log('User added to Google Sheets:', { telefone, email, nombre });

    return new Response(
      JSON.stringify({ success: true, message: 'Usuario agregado al Google Sheets' }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error adding user to sheets:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});