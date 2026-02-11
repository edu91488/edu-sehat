import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin-client'
import nodemailer from 'nodemailer'

export async function POST() {
  try {
    const supabase = createAdminClient()

    // find user_progress rows where available_at <= now and notification_sent_at is null
    const nowIso = new Date().toISOString()
    const { data: rows, error } = await supabase
      .from('user_progress')
      .select('id, user_id, stage_id')
      .lte('available_at', nowIso)
      .is('notification_sent_at', null)
      .eq('completed', false)

    if (error) {
      console.error('Error fetching rows for notification', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    // setup transporter - use SMTP env vars
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    })

    let sentCount = 0

    for (const r of rows) {
      // fetch user's email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', r.user_id)
        .maybeSingle()

      const email = profile?.email || null

      if (!email) {
        // skip if no email
        await supabase
          .from('user_progress')
          .update({ notification_sent_at: new Date().toISOString() })
          .eq('id', r.id)
        continue
      }

      const subject = `Edukasi Tersedia: ${r.stage_id.replace('-', ' ')}`
      const text = `Halo,\n\nEdukasi ${r.stage_id.replace('-', ' ')} sekarang dapat diakses. Silakan masuk ke aplikasi untuk melanjutkan pembelajaran.\n\nSalam,\nTim EduSehat`

      try {
        if (!process.env.SMTP_HOST) {
          console.warn('SMTP not configured, skipping email send')
        } else {
          await transporter.sendMail({
            from: process.env.FROM_EMAIL || process.env.SMTP_USER,
            to: email,
            subject,
            text,
          })
        }

        await supabase
          .from('user_progress')
          .update({ notification_sent_at: new Date().toISOString() })
          .eq('id', r.id)

        sentCount++
      } catch (e) {
        console.error('Failed to send email to', email, e)
      }
    }

    return NextResponse.json({ sent: sentCount })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
