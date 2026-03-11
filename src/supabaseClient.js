import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://twsgjoobibsupduicsyu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3c2dqb29iaWJzdXBkdWljc3l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDU0MjMsImV4cCI6MjA4ODgyMTQyM30.JefPbKmInq0NsZvfITmJ9znBRjSvemcPZWrviKi48T8";

export const supabase = createClient(supabaseUrl, supabaseKey);