import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xytexfloilsujckvnlsa.supabase.co',
  'sb_publishable_dHO9p8eqMeJ4CIozK1swCg_hi4tnW1Q'
)

async function test() {
  console.log('Fetching profiles...')
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    
  console.log("Fetch Error:", error)
  console.log("Fetch Data:", data)
}

test()
