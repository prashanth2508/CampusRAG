import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def send_otp_email(to_email: str, otp_code: str, user_name: str = "Student") -> bool:
    """
    Sends a secure 6-digit OTP email to the user for password recovery.
    Supports SMTP (Gmail, Brevo, SendGrid, Outlook, custom SMTP server).
    """
    clean_email = to_email.strip().lower()
    subject = f"🔒 {otp_code} is your CampusRAG Verification Code"
    sender_name = settings.SMTP_FROM_NAME or "CampusRAG Academic Security"
    sender_email = settings.SMTP_FROM_EMAIL or settings.SMTP_USER or "noreply@campusrag.edu"

    # HTML Email Template
    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); overflow: hidden;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #111827; padding: 28px 30px; text-align: center;">
              <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 50%; background-color: #1f2937; margin-bottom: 12px; font-size: 22px;">
                🎓
              </div>
              <h1 style="margin: 0; color: #f8fafc; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">
                Campus<span style="color: #a3e635;">RAG</span>
              </h1>
              <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 12px;">
                Academic Knowledge Assistant
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 30px 24px 30px;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #0f172a;">
                Password Reset Verification
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Hello <strong>{user_name}</strong>,<br>
                We received a request to reset the password for your CampusRAG account associated with <strong style="color: #0f172a;">{clean_email}</strong>. Use the verification code below to complete the reset:
              </p>

              <!-- OTP Code Display Card -->
              <div style="background-color: #f7fee7; border: 1.5px dashed #84cc16; border-radius: 14px; padding: 22px; text-align: center; margin: 24px 0;">
                <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #4d7c0f; margin-bottom: 6px;">
                  Your 6-Digit OTP Code
                </span>
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #14532d; display: inline-block;">
                  {otp_code}
                </span>
                <span style="display: block; font-size: 12px; color: #65a30d; margin-top: 8px;">
                  ⏱️ Valid for <strong>10 minutes</strong>
                </span>
              </div>

              <!-- Security Advisory -->
              <div style="background-color: #f1f5f9; border-radius: 10px; padding: 14px 16px; margin: 20px 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                🔒 <strong>Security Warning:</strong> Never share this OTP code with anyone. CampusRAG administrators will never ask for your password or OTP.
              </div>

              <p style="margin: 20px 0 0 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                If you did not initiate this password reset, you can safely ignore this email — your existing password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px 30px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
              This is an automated security notification from CampusRAG.<br>
              © 2026 CampusRAG Academic Intelligence System. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    # Plain text version for fallback
    plain_content = f"""CampusRAG - Password Reset Verification

Hello {user_name},

Your verification OTP code for password reset is:

    [ {otp_code} ]

This code is valid for 10 minutes.
If you did not request this, please ignore this email.

--
CampusRAG Academic Security
"""

    # Build MIME message
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{sender_name} <{sender_email}>"
    msg["To"] = clean_email
    msg.attach(MIMEText(plain_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    # Attempt SMTP transmission if configured
    if settings.SMTP_USER and settings.SMTP_PASSWORD:
        try:
            port = settings.SMTP_PORT or 587
            host = settings.SMTP_HOST or "smtp.gmail.com"

            if port == 465:
                # SSL
                server = smtplib.SMTP_SSL(host, port, timeout=12)
            else:
                # STARTTLS
                server = smtplib.SMTP(host, port, timeout=12)
                server.ehlo()
                server.starttls()
                server.ehlo()

            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            print(f"\n=======================================================")
            print(f"📧 REAL OTP EMAIL SENT TO: {clean_email} via SMTP ({host}:{port})")
            print(f"🔒 OTP CODE: {otp_code}")
            print(f"=======================================================\n")
            return True
        except Exception as e:
            print(f"\n⚠️ SMTP delivery failed for {clean_email}: {e}")
            print(f"🔒 OTP CODE (FALLBACK): {otp_code}\n")
            return False
    else:
        print(f"\n=======================================================")
        print(f"ℹ️ SMTP NOT CONFIGURED: Add SMTP_USER and SMTP_PASSWORD in backend/.env")
        print(f"🔒 OTP CODE FOR {clean_email}: [ {otp_code} ] (Valid 10 mins)")
        print(f"=======================================================\n")
        return False

