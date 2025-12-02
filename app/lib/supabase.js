import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mrjsyohjxglscrfgmnvb.supabase.co";   // 🔹 Replace with your Project URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanN5b2hqeGdsc2NyZmdtbnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3OTcxMTYsImV4cCI6MjA3NDM3MzExNn0.LmjYpHoTWI1DbaFAdTsxR1syeSFLaXpxd_oqgN-lofI";                 // 🔹 Replace with your Project's anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
