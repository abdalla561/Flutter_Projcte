import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xytexfloilsujckvnlsa.supabase.co',
  'sb_publishable_dHO9p8eqMeJ4CIozK1swCg_hi4tnW1Q'
)

async function test() {
  console.log('Testing Supabase login...')
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@gmail.com',
    password: '12345678'
  })
  
  console.log("Auth Error:", error)
  console.log("Auth Data:", data)

  if (data?.user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()
      
    console.log("Profile Error:", profileError)
    console.log("Profile Data:", profile)
  }
}

test()
