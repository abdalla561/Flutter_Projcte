import { supabase } from '../lib/supabase'

export const authService = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    // Fetch user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      await supabase.auth.signOut()
      throw new Error('User profile not found. Please contact an administrator.')
    }

    if (!['admin', 'staff'].includes(profile.role)) {
      await supabase.auth.signOut()
      throw new Error('ليس لديك صلاحية الدخول لهذا الموقع')
    }

    return { ...data, role: profile.role }
  },

  async signOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  },

  async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return { data: { session: null } }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile && ['admin', 'staff'].includes(profile.role)) {
        return { data: { session: { ...session, role: profile.role } } }
      }
      
      return { data: { session: null } }
    } catch (err) {
      console.error('[Auth] Error getting session:', err)
      return { data: { session: null } }
    }
  },

  onAuthStateChange(callback) {

    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        callback(null)
        return
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (profile && ['admin', 'staff'].includes(profile.role)) {
          callback({ ...session, role: profile.role })
        } else {
          // If not authorized, just return null to the app
          // Don't call signOut() here as it causes lock contention
          callback(null)
        }
      } catch (err) {
        console.error('[Auth] Error checking profile:', err)
        callback(null)
      }
    })
  }
}
