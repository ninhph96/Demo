import { createClient } from '@supabase/supabase-js'

// Dán trực tiếp mã của bạn vào đây để deploy lên GitHub Pages không bị lỗi
const supabaseUrl = 'https://pojaafndtkxbhityeqmt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvamFhZm5kdGt4YmhpdHllcW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDc5NjksImV4cCI6MjA4ODk4Mzk2OX0.OwqF7eUV4X1lAR0YpL4Ms5nHrwOjjAbOEqf-wVM4cUQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)