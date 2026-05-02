import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xytexfloilsujckvnlsa.supabase.co',
  'sb_publishable_dHO9p8eqMeJ4CIozK1swCg_hi4tnW1Q'
)

async function test() {
  console.log('Inserting profile for admin@gmail.com...')
  const userId = '0beba9c1-8e3a-4405-8fba-b1fad144e8bd'
  
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      { id: userId, name: 'Admin', role: 'admin' }
    ])
    .select()
    
  console.log("Insert Error:", error)
  console.log("Insert Data:", data)
}

test()
