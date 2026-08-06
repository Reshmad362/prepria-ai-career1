import os
import smtplib
import logging
import traceback
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

# Constants
SMTP_SERVER = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))

def get_email_credentials():
    user = os.environ.get("EMAIL_USER")
    password = os.environ.get("EMAIL_PASS")
    return user, password

def get_base_html(content: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f7f6;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }}
            .header {{
                background-color: #111111;
                color: #ffffff;
                padding: 20px;
                text-align: center;
            }}
            .header h1 {{
                margin: 0;
                font-size: 24px;
                color: #FF7A00;
            }}
            .content {{
                padding: 30px;
            }}
            .footer {{
                background-color: #f8fafc;
                color: #64748b;
                text-align: center;
                padding: 15px;
                font-size: 12px;
                border-top: 1px solid #e2e8f0;
            }}
            .data-row {{
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 1px solid #e2e8f0;
            }}
            .data-row:last-child {{
                border-bottom: none;
            }}
            .label {{
                font-weight: bold;
                color: #475569;
                display: block;
                margin-bottom: 5px;
            }}
            .value {{
                color: #0f172a;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>AI Career Platform</h1>
            </div>
            <div class="content">
                {content}
            </div>
            <div class="footer">
                <p>This is an automated notification from the AI Career Platform.</p>
            </div>
        </div>
    </body>
    </html>
    """

def create_signup_template(data: Dict[str, Any]) -> str:
    content = f"""
        <h2>Welcome to AI Career Platform!</h2>
        <p>Your account has been successfully created.</p>
        <div class="data-row">
            <span class="label">Name:</span>
            <span class="value">{data.get('name', 'N/A')}</span>
        </div>
        <div class="data-row">
            <span class="label">Email:</span>
            <span class="value">{data.get('email', 'N/A')}</span>
        </div>
    """
    return get_base_html(content)

def create_resume_template(data: Dict[str, Any]) -> str:
    skills = data.get('skills', [])
    skills_str = ", ".join(skills) if isinstance(skills, list) else str(skills)
    
    content = f"""
        <h2>Resume Uploaded & Analyzed</h2>
        <p>We've successfully processed your resume for ATS analysis.</p>
        <div class="data-row">
            <span class="label">Filename:</span>
            <span class="value">{data.get('filename', 'N/A')}</span>
        </div>
        <div class="data-row">
            <span class="label">ATS Score:</span>
            <span class="value" style="font-size: 1.2em; font-weight: bold; color: #2563eb;">{data.get('atsScore', 'N/A')}/100</span>
        </div>
        <div class="data-row">
            <span class="label">Extracted Skills:</span>
            <span class="value">{skills_str}</span>
        </div>
    """
    return get_base_html(content)

def create_interview_template(data: Dict[str, Any]) -> str:
    content = f"""
        <h2>Mock Interview Completed</h2>
        <p>Your mock interview results are ready.</p>
        <div class="data-row">
            <span class="label">Role:</span>
            <span class="value">{data.get('role', 'N/A')}</span>
        </div>
        <div class="data-row">
            <span class="label">Overall Score:</span>
            <span class="value" style="font-size: 1.2em; font-weight: bold; color: #2563eb;">{data.get('overallScore', 'N/A')}/10</span>
        </div>
        <div class="data-row">
            <span class="label">AI Summary:</span>
            <span class="value">{data.get('summary', 'N/A')}</span>
        </div>
    """
    return get_base_html(content)

def create_course_template(data: Dict[str, Any]) -> str:
    content = f"""
        <h2>Course Completed</h2>
        <p>Congratulations on completing the course!</p>
        <div class="data-row">
            <span class="label">Course Name:</span>
            <span class="value">{data.get('courseName', 'N/A')}</span>
        </div>
        <div class="data-row">
            <span class="label">Completion Percentage:</span>
            <span class="value">{data.get('completionPercentage', '100')}%</span>
        </div>
    """
    return get_base_html(content)

def create_certificate_template(data: Dict[str, Any]) -> str:
    content = f"""
        <h2>Certificate Generated</h2>
        <p>Your certificate is ready to download.</p>
        <div class="data-row">
            <span class="label">Certificate ID:</span>
            <span class="value">{data.get('certificateId', 'N/A')}</span>
        </div>
        <div class="data-row">
            <span class="label">Download Link:</span>
            <span class="value"><a href="{data.get('downloadLink', '#')}" style="color: #2563eb; text-decoration: none;">Download Certificate</a></span>
        </div>
    """
    return get_base_html(content)

def create_otp_template(data: Dict[str, Any]) -> str:
    otp = data.get('otp', '000000')
    purpose = data.get('purpose', 'LOGIN')
    
    title = "Verify Your Login"
    desc = "We received a request to log in to your AI Career Intelligence Platform account."
    
    if purpose == "PASSWORD_RESET":
        title = "Reset Your Password"
        desc = "We received a request to reset your password for your AI Career Intelligence Platform account."
        
    content = f"""
        <h2>{title}</h2>
        <p>{desc}</p>
        <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px; text-align: center;">
            <p class="label" style="margin-bottom: 10px;">Your Verification Code:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #FF7A00;">{otp}</div>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code will expire in <strong>5 minutes</strong>.</p>
        <p style="color: #64748b; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
    """
    return get_base_html(content)

def send_notification_email(subject: str, event_type: str, data: Dict[str, Any]) -> bool:
    """
    Sends an email notification for a specific event type.
    """
    user, password = get_email_credentials()
    
    if not user or not password:
        logger.error("EMAIL_USER or EMAIL_PASS not set in environment variables. Email service disabled.")
        return False

    recipient_email = data.get("email")
    if not recipient_email:
        logger.error(f"Missing recipient 'email' in data for event: {event_type}. Cannot send email.")
        return False

    html_content = ""
    if event_type == "signup":
        html_content = create_signup_template(data)
    elif event_type == "resume_upload":
        html_content = create_resume_template(data)
    elif event_type == "interview":
        html_content = create_interview_template(data)
    elif event_type == "course_completion":
        html_content = create_course_template(data)
    elif event_type == "certificate":
        html_content = create_certificate_template(data)
    elif event_type == "otp":
        html_content = create_otp_template(data)
    else:
        logger.error(f"Unknown email event type: {event_type}")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"AI Career Platform <{user}>"
    msg["To"] = recipient_email

    part = MIMEText(html_content, "html")
    msg.attach(part)

    try:
        logger.info(f"Establishing SMTP connection to {SMTP_SERVER}:{SMTP_PORT}...")
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.set_debuglevel(1)  # Enable SMTP debug logging
            
            logger.info("Starting TLS...")
            server.starttls()
            
            logger.info("Attempting SMTP login...")
            server.login(user, password)
            logger.info("SMTP login successful.")
            
            logger.info(f"Sending message to {recipient_email}...")
            server.send_message(msg)
            
        logger.info(f"Email sent successfully to {recipient_email} for event: {event_type}")
        return True
    except smtplib.SMTPAuthenticationError as auth_err:
        logger.error(f"SMTP Authentication Error: The EMAIL_USER or EMAIL_PASS is invalid, or an App Password is required. Details: {str(auth_err)}")
        return False
    except Exception as e:
        logger.error(f"Failed to send email to {recipient_email} for {event_type}. Exception details:\n{traceback.format_exc()}")
        return False
