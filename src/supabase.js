import { createClient } from '@supabase/supabase-js'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const signInWithGoogle = async () => {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  })
}
export const signInWithEmail = async (email, password) => {
  return await supabase.auth.signInWithPassword({ email, password })
}
export const signUpWithEmail = async (email, password, metadata) => {
  return await supabase.auth.signUp({ email, password, options: { data: metadata } })
}
export const signOut = async () => await supabase.auth.signOut()
export const getProfile = async (userId) => {
  return await supabase.from('profiles').select('*').eq('id', userId).single()
}
export const createBooking = async (booking) => {
  return await supabase.from('bookings').insert([booking]).select()
}
export const getCaretakers = async () => {
  return await supabase.from('caretakers').select('*').order('rating', { ascending: false })
}
