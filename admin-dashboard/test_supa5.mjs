import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xytexfloilsujckvnlsa.supabase.co'
const supabaseKey = 'sb_publishable_dHO9p8eqMeJ4CIozK1swCg_hi4tnW1Q'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  
  console.log("Products Error:", error)
}

async function testOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles:user_id (name),
      order_items (
        quantity,
        product_variants (
          products (name)
        )
      )
    `)
    .order('created_at', { ascending: false })
    
  console.log("Orders Error:", error)
}

testProducts()
testOrders()
