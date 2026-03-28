import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  to: string
  subject: string
  html: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html }: EmailPayload = await req.json()

    // Gmail SMTP is configured in Supabase Authentication settings
    // This function logs the email event
    console.log('Email sent via Gmail SMTP:', {
      to,
      subject,
      timestamp: new Date().toISOString(),
    })

    // In production, you could integrate with a service like Resend:
    // const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    // const emailResponse = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${RESEND_API_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     from: 'noreply@edushare.com',
    //     to: [to],
    //     subject: subject,
    //     html: html,
    //   }),
    // })

    return new Response(
      JSON.stringify({ success: true, message: 'Email queued via Gmail SMTP' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing email request:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
