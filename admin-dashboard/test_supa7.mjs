import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xytexfloilsujckvnlsa.supabase.co'
const supabaseKey = 'sb_publishable_dHO9p8eqMeJ4CIozK1swCg_hi4tnW1Q'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testAll() {
  console.log("Testing Products...")
  const p = await supabase.from('products').select('*').order('id', { ascending: false }).limit(1)
  console.log("Products:", p.error ? p.error.message : "Success")

  console.log("Testing Orders...")
  const o = await supabase.from('orders').select(`
    *,
    profiles(name),
    order_items(
      quantity,
      products(name)
    )
  `).order('created_at', { ascending: false }).limit(1)
  console.log("Orders:", o.error ? o.error.message : "Success")

  console.log("Testing Profiles...")
  const u = await supabase.from('profiles').select('*').limit(1)
  console.log("Profiles:", u.error ? u.error.message : "Success")

  console.log("Testing Profile Count...")
  const c = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  console.log("Profile Count:", c.error ? c.error.message : "Success")
}

testAll()
