import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xytexfloilsujckvnlsa.supabase.co'
const supabaseKey = 'sb_publishable_dHO9p8eqMeJ4CIozK1swCg_hi4tnW1Q'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(1)
  
  console.log("Products Schema Error:", error)
}

async function testOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles(name),
      order_items(
        quantity,
        products(name)
      )
    `)
    .limit(1)
    
  console.log("Orders Schema Error:", error)
}

testProducts()
testOrders()
