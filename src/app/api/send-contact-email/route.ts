import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!email || !message) {
      return NextResponse.json({ error: 'Email and message are required' }, { status: 400 })
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'FindYourDoctor <no-reply@findyourdoctor.ca>',
        to: 'support@findyourdoctor.ca',
        subject: subject || `Contact Form from ${email}`,
        reply_to: email,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name || 'Not provided'}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
      }),
    })

    const data = await resendResponse.json()
    if (!resendResponse.ok) throw new Error(data.message || 'Failed to send email')

    return NextResponse.json({ success: true, message: 'Message sent successfully' })
  } catch (error: any) {
    console.error('Contact email error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
