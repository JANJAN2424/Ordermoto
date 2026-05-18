import { createClient } from '@supabase/supabase-js'

const createError = (message, statusCode = 500) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

const getBaseConfig = () => {
  const url = process.env.SUPABASE_URL?.trim()

  if (!url) {
    throw createError(
      'Supabase Auth is not configured. Set SUPABASE_URL before registering or signing in customers.',
    )
  }

  return { url }
}

const getPublicConfig = () => {
  const { url } = getBaseConfig()
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim()

  if (!anonKey) {
    throw createError(
      'Supabase Auth is not configured. Set SUPABASE_ANON_KEY before signing in customers.',
    )
  }

  return {
    url,
    anonKey,
  }
}

const getAdminConfig = () => {
  const { url } = getBaseConfig()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!serviceRoleKey) {
    throw createError(
      'Supabase Auth is not configured. Set SUPABASE_SERVICE_ROLE_KEY before registering customers.',
    )
  }

  return {
    url,
    serviceRoleKey,
  }
}

const createServerClient = (url, key) =>
  createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

const toUserFacingError = (error, fallbackMessage, fallbackStatusCode = 400) => {
  const message = error?.message?.trim() || fallbackMessage
  const statusCode = Number.isInteger(error?.status) ? error.status : fallbackStatusCode

  if (/already (been )?registered/i.test(message)) {
    return createError('A customer account with this email already exists.', 400)
  }

  if (/invalid login credentials/i.test(message)) {
    return createError('Invalid customer email or password.', 401)
  }

  if (/email not confirmed/i.test(message)) {
    return createError('Please confirm your email address before signing in.', 401)
  }

  if (/password/i.test(message) || /email/i.test(message)) {
    return createError(message, 400)
  }

  return createError(message || fallbackMessage, statusCode)
}

export const registerCustomerAuthUser = async ({ email, password, metadata }) => {
  const { url, serviceRoleKey } = getAdminConfig()
  const supabase = createServerClient(url, serviceRoleKey)
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  })

  if (error) {
    throw toUserFacingError(error, 'Unable to create the customer in Supabase Auth.')
  }

  const userId = data.user?.id?.trim()

  if (!userId) {
    throw createError('Supabase Auth did not return the new customer user id.')
  }

  return {
    userId,
  }
}

export const deleteCustomerAuthUser = async (userId) => {
  if (!userId) {
    return
  }

  const { url, serviceRoleKey } = getAdminConfig()
  const supabase = createServerClient(url, serviceRoleKey)
  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    throw toUserFacingError(error, 'Unable to roll back the customer auth user.', 500)
  }
}

export const signInCustomerWithSupabase = async ({ email, password }) => {
  const { url, anonKey } = getPublicConfig()
  const supabase = createServerClient(url, anonKey)
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw toUserFacingError(error, 'Unable to sign in the customer.', 401)
  }

  const userId = data.user?.id?.trim()

  if (!userId) {
    throw createError('Supabase Auth did not return the signed-in customer.', 500)
  }

  return {
    userId,
    email: data.user?.email?.trim().toLowerCase() ?? email,
    metadata: data.user?.user_metadata ?? {},
  }
}
