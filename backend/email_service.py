import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

# We'll support both old naming conventions from .env and typical SMTP var names
MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp-relay.brevo.com").strip()
MAIL_PORT = int(os.getenv("Port", os.getenv("MAIL_PORT", "587")).strip())
MAIL_USERNAME = os.getenv("MAIL_USERNAME", os.getenv("BREVO_API_KEY", "")).strip('\'" ')
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", os.getenv("BREVO_API_KEY", "")).strip('\'" ')
MAIL_FROM = os.getenv("MAIL_FROM", "24bca31acas@gmail.com").strip()

def send_otp_email(recipient_email, otp, recipient_name="User"):
    if not MAIL_USERNAME or not MAIL_PASSWORD:
        print("Mail credentials not found in environment (MAIL_USERNAME / MAIL_PASSWORD)")
        return False

    msg = EmailMessage()
    msg['Subject'] = "Your OTP for Campus Updates"
    msg['From'] = f"Campus Updates <{MAIL_FROM}>"
    msg['To'] = f"{recipient_name} <{recipient_email}>"

    html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
            <h2 style="color: #1e3a8a; text-align: center;">Campus Updates</h2>
            <div style="padding: 20px; text-align: center;">
                <p style="font-size: 16px; color: #334155;">Hello {recipient_name},</p>
                <p style="font-size: 16px; color: #334155;">Welcome to <b>Avichi College's official communication portal</b>. Use the OTP below to verify your email address:</p>
                <div style="font-size: 42px; font-weight: 800; color: #1e3a8a; margin: 30px 0; letter-spacing: 8px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px dashed #cbd5e1;">
                    {otp}
                </div>
                <p style="font-size: 14px; color: #64748b;">This OTP is valid for 10 minutes. If you didn't request this, please ignore this email.</p>
            </div>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; {recipient_email.split('@')[0]} Avichi College of Arts and Science</p>
        </div>
    """
    
    msg.set_content("Your OTP is: " + str(otp))
    msg.add_alternative(html_content, subtype='html')

    try:
        with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Error sending email via SMTP: {e}")
        return False
