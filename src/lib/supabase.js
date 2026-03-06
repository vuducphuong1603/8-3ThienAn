import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zzafbjitmdlazltwlmiu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6YWZiaml0bWRsYXpsdHdsbWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTQ3MDgsImV4cCI6MjA4ODM3MDcwOH0.EVWZ0ZKl1xmTybhtqw6ZJrSJ8ay8gp55pHYErf1VC38';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export { SUPABASE_URL };
