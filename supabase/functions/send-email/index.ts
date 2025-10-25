import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import ConfirmSignupEmail from './_templates/confirm-signup.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('not allowed', { status: 400 })

  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)
  const wh = new Webhook(hookSecret)

  try {
    const {
      user,
      email_data: { token_hash, redirect_to, email_action_type, site_url },
    } = wh.verify(payload, headers) as {
      user: { email: string }
      email_data: {
        token_hash: string
        redirect_to: string
        email_action_type: string
        site_url: string
      }
    }

    if (email_action_type !== 'signup') {
      return new Response('ignored', { status: 200 })
    }

    const supabase_url = Deno.env.get('SUPABASE_URL') || site_url
    const confirmation_url = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to)}`

    const html = await renderAsync(
      React.createElement(ConfirmSignupEmail, { confirmation_url })
    )

    const { error } = await resend.emails.send({
      from: 'Tu Mayordomo <no-reply@tumayordomo.app>',
      to: [user.email],
      subject: 'Confirma tu correo | Tu Mayordomo',
      html,
    })
    if (error) throw error
  } catch (error) {
    console.log('send-email error', error)
    return new Response(
      JSON.stringify({ error: { message: (error as any)?.message || 'unknown' } }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
