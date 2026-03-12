import os
import requests
from dotenv import load_dotenv

load_dotenv()

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
MAIL_FROM = os.getenv("MAIL_FROM", "no-reply@campus-updates.com")

def send_otp_email(recipient_email, otp, recipient_name="User"):
    if not BREVO_API_KEY:
        print("BREVO_API_KEY not found in environment")
        return False

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }
    
    payload = {
        "sender": {"name": "Campus Updates", "email": MAIL_FROM},
        "to": [{"email": recipient_email, "name": recipient_name}],
        "subject": "Your OTP for Campus Updates",
        "htmlContent": f"""
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
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"Error sending email via Brevo: {e}")
        if hasattr(e, 'response') and e.response is not None:
             print(f"Response: {e.response.text}")
        return False
