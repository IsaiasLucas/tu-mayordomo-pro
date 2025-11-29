import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'https://esm.sh/resend@4.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

const createConfirmationEmail = (confirmation_url: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f7f5ff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
  <div style="max-width: 560px; margin: 40px auto; background: #fff; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
    <div style="background-color: #9d75f0; text-align: center; padding: 24px 20px;">
      <h1 style="color: #fff; font-size: 22px; margin: 0;">Tu Mayordomo 🤖</h1>
    </div>
    
    <div style="padding: 30px 25px; text-align: center;">
      <h2 style="color: #4a1fb8; margin: 0 0 10px; font-size: 22px;">Confirma tu correo electrónico</h2>
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 20px;">¡Hola! Falta un paso para activar tu cuenta y comenzar a controlar tus finanzas con Tu Mayordomo.</p>
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 20px;">Haz clic en el siguiente botón para confirmar tu correo y empezar:</p>
      <a href="${confirmation_url}" target="_blank" style="display: inline-block; background-color: #7e55e7; color: #fff; text-decoration: none; padding: 14px 26px; border-radius: 30px; font-weight: 600; font-size: 15px;">Confirmar mi correo</a>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
      <p style="font-size: 12px; color: #777;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
      <a href="${confirmation_url}" target="_blank" style="color: #7e55e7; text-decoration: underline; font-size: 12px; word-break: break-all;">${confirmation_url}</a>
    </div>
    
    <div style="background: #faf8ff; text-align: center; padding: 20px;">
      <p style="font-size: 12px; color: #777; margin: 0 0 8px;">Si no creaste una cuenta en Tu Mayordomo, puedes ignorar este mensaje.</p>
      <p style="font-size: 12px; color: #999; margin: 0;">Gracias por hacer parte de esta comunidad 💚 | Gestión financiera por IA 🇨🇱</p>
    </div>
  </div>
</body>
</html>
`

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

    const html = createConfirmationEmail(confirmation_url)

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
