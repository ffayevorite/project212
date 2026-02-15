import smtplib
from email.mime.text import MIMEText
import os

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")

def send_otp_email(to_email: str, otp_code: str):
    body = f"""
    CMU Verification Code

    Your OTP Code is: {otp_code}

    This code will expire in 5 minutes.
    """

    msg = MIMEText(body)
    msg["Subject"] = "CMU Email Verification"
    msg["From"] = SMTP_USER
    msg["To"] = to_email

    server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
    server.ehlo()
    server.starttls()
    server.ehlo()
    server.login(SMTP_USER, SMTP_PASS)
    server.send_message(msg)
    server.quit()
