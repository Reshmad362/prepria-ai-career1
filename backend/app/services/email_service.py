import os
import smtplib
import logging
import traceback
from pathlib import Path
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Tuple, Optional

logger = logging.getLogger(__name__)

# Known placeholder values that indicate unconfigured settings
_PLACEHOLDER_VALUES = {
    "your-email@gmail.com",
    "your-app-password",
    "your-smtp-host",
    "your-smtp-user",
    "your-smtp-password",
    "example@gmail.com",
    "",
    None
}

def load_env():
    """Ensure backend/.env is loaded into os.environ."""
    backend_dir = Path(__file__).resolve().parent.parent.parent
    env_file = backend_dir / ".env"
    if not env_file.exists():
        env_file = Path.cwd() / ".env"
    if env_file.exists():
        try:
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip("'\"")
                    if k and k not in os.environ:
                        os.environ[k] = v
        except Exception:
            pass

def is_development_mode() -> bool:
    """Check if the backend is running in development mode."""
    load_env()
    env = os.environ.get("APP_ENV", "development").strip().lower()
    return env in ("development", "dev", "local", "test", "")

def get_smtp_config() -> Tuple[str, int]:
    """Retrieve SMTP host and port from environment."""
    load_env()
    host = (
        os.environ.get("SMTP_HOST")
        or os.environ.get("MAIL_SERVER")
        or os.environ.get("SMTP_SERVER")
        or "smtp.gmail.com"
    ).strip()
    
    port_str = (
        os.environ.get("SMTP_PORT")
        or os.environ.get("MAIL_PORT")
        or "587"
    ).strip()
    
    try:
        port = int(port_str)
    except ValueError:
        port = 587
        
    return host, port

def get_email_credentials() -> Tuple[Optional[str], Optional[str]]:
    """
    Retrieve and sanitize email username & password/app password from environment.
    Supports EMAIL_USER/EMAIL_PASS, SMTP_USER/SMTP_PASS, etc.
    """
    load_env()
    user = (
        os.environ.get("EMAIL_USER")
        or os.environ.get("SMTP_USER")
        or os.environ.get("SMTP_USERNAME")
        or os.environ.get("MAIL_USERNAME")
    )
    password = (
        os.environ.get("EMAIL_PASS")
        or os.environ.get("SMTP_PASS")
        or os.environ.get("SMTP_PASSWORD")
        or os.environ.get("MAIL_PASSWORD")
    )
    
    if not user or not password:
        return None, None
        
    user = user.strip().strip("'\"")
    password = password.strip().strip("'\"")
    
    if user in _PLACEHOLDER_VALUES or password in _PLACEHOLDER_VALUES:
        return None, None
        
    # If it's a 16-character Google App Password with spaces (e.g. "abcd efgh ijkl mnop"), remove spaces
    if len(password.replace(" ", "")) == 16:
        password = password.replace(" ", "")
        
    return user, password

def get_base_html(content: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #2E2E3A;
                background-color: #F8F9FB;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 580px;
                margin: 30px auto;
                background-color: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 24px rgba(0,0,0,0.07);
                border: 1px solid #EAEAEF;
            }}
            .header {{
                background-color: #0B0B0D;
                color: #ffffff;
                padding: 28px 24px;
                text-align: center;
            }}
            .header h1 {{
                margin: 0;
                font-size: 22px;
                font-weight: 800;
                letter-spacing: 0.05em;
                color: #FF6B00;
            }}
            .header p {{
                margin: 4px 0 0;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.18em;
                color: #888899;
            }}
            .content {{
                padding: 32px 28px;
            }}
            .footer {{
                background-color: #FAFAFC;
                color: #888899;
                text-align: center;
                padding: 18px;
                font-size: 12px;
                border-top: 1px solid #F0F0F4;
            }}
            .data-row {{
                margin-bottom: 14px;
                padding-bottom: 14px;
                border-bottom: 1px solid #F0F0F4;
            }}
            .data-row:last-child {{
                border-bottom: none;
            }}
            .label {{
                font-weight: 600;
                color: #666677;
                display: block;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 4px;
            }}
            .value {{
                color: #111118;
                font-size: 14px;
                font-weight: 500;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>PREPRIA</h1>
                <p>Career Intelligence Platform</p>
            </div>
            <div class="content">
                {content}
            </div>
            <div class="footer">
                <p>&copy; 2026 PREPRIA. This is an automated notification.</p>
            </div>
        </div>
    </body>
    </html>
    """

def create_signup_template(data: Dict[str, Any]) -> str:
    content = f"""
        <h2 style="color: #111118; margin-top: 0;">Welcome to PREPRIA!</h2>
        <p style="color: #555566;">Your account has been successfully created. You can now access all AI mock interview tools and career roadmaps.</p>
        <div class="data-row">
            <span class="label">Name:</span>
            <span class="value">{data.get('name', 'Candidate')}</span>
        </div>
        <div class="data-row">
            <span class="label">Email:</span>
            <span class="value">{data.get('email', '')}</span>
        </div>
    """
    return get_base_html(content)

def create_resume_template(data: Dict[str, Any]) -> str:
    skills = data.get('skills', [])
    skills_str = ", ".join(skills) if isinstance(skills, list) else str(skills)
    
    content = f"""
        <h2 style="color: #111118; margin-top: 0;">Resume Analysis Complete</h2>
        <p style="color: #555566;">Your resume has been processed by our ATS Intelligence Engine.</p>
        <div class="data-row">
            <span class="label">Filename:</span>
            <span class="value">{data.get('filename', 'Resume')}</span>
        </div>
        <div class="data-row">
            <span class="label">ATS Score:</span>
            <span class="value" style="font-size: 1.3em; font-weight: 800; color: #FF6B00;">{data.get('atsScore', 'N/A')}/100</span>
        </div>
        <div class="data-row">
            <span class="label">Detected Competencies:</span>
            <span class="value">{skills_str}</span>
        </div>
    """
    return get_base_html(content)

def create_interview_template(data: Dict[str, Any]) -> str:
    content = f"""
        <h2 style="color: #111118; margin-top: 0;">Mock Interview Completed</h2>
        <p style="color: #555566;">Your performance scorecard is ready to view.</p>
        <div class="data-row">
            <span class="label">Target Role:</span>
            <span class="value">{data.get('role', 'N/A')}</span>
        </div>
        <div class="data-row">
            <span class="label">Overall Score:</span>
            <span class="value" style="font-size: 1.3em; font-weight: 800; color: #FF6B00;">{data.get('overallScore', 'N/A')}/10</span>
        </div>
        <div class="data-row">
            <span class="label">AI Evaluation Summary:</span>
            <span class="value">{data.get('summary', 'N/A')}</span>
        </div>
    """
    return get_base_html(content)

def create_course_template(data: Dict[str, Any]) -> str:
    content = f"""
        <h2 style="color: #111118; margin-top: 0;">Course Milestone Completed</h2>
        <p style="color: #555566;">Congratulations on completing your course module!</p>
        <div class="data-row">
            <span class="label">Course Name:</span>
            <span class="value">{data.get('courseName', 'N/A')}</span>
        </div>
        <div class="data-row">
            <span class="label">Completion Progress:</span>
            <span class="value" style="color: #10B981; font-weight: 700;">{data.get('completionPercentage', '100')}%</span>
        </div>
    """
    return get_base_html(content)

def create_certificate_template(data: Dict[str, Any]) -> str:
    content = f"""
        <h2 style="color: #111118; margin-top: 0;">Certificate Generated</h2>
        <p style="color: #555566;">Your credential has been issued and is verified on the PREPRIA registry.</p>
        <div class="data-row">
            <span class="label">Certificate ID:</span>
            <span class="value">{data.get('certificateId', 'N/A')}</span>
        </div>
        <div class="data-row">
            <span class="label">Download Link:</span>
            <span class="value"><a href="{data.get('downloadLink', '#')}" style="color: #FF6B00; text-decoration: underline; font-weight: 600;">Download Certificate</a></span>
        </div>
    """
    return get_base_html(content)

def create_otp_template(data: Dict[str, Any]) -> str:
    otp = data.get('otp', '000000')
    purpose = data.get('purpose', 'LOGIN')
    
    title = "Your Verification Code"
    desc = "We received a request to authenticate your PREPRIA account."
    
    if purpose == "PASSWORD_RESET":
        title = "Reset Your Password"
        desc = "We received a request to reset your password for your PREPRIA account."
        
    content = f"""
        <h2 style="color: #111118; margin-top: 0; font-size: 20px;">{title}</h2>
        <p style="color: #555566; font-size: 14px; margin-bottom: 24px;">{desc}</p>
        <div style="margin: 24px 0; padding: 24px; background-color: #FFF5EF; border: 1.5px solid #FFD6BF; border-radius: 12px; text-align: center;">
            <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; color: #8A3B00; text-transform: uppercase; letter-spacing: 0.1em;">Your 6-Digit Verification Code</p>
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #FF6B00; font-family: monospace;">{otp}</div>
        </div>
        <p style="color: #666677; font-size: 13px; margin: 16px 0 6px;">This code will expire in <strong style="color: #111118;">5 minutes</strong>.</p>
        <p style="color: #888899; font-size: 12px; margin: 0;">If you did not request this verification code, please ignore this email.</p>
    """
    return get_base_html(content)

def print_dev_otp(recipient_email: str, otp_code: str, purpose: str):
    """Print the generated OTP clearly in the backend terminal for development mode."""
    box = [
        "",
        "╔════════════════════════════════════════════════════════════════╗",
        "║                     [PREPRIA DEV OTP]                          ║",
        "╠════════════════════════════════════════════════════════════════╣",
        f"║  Email:    {recipient_email:<50}  ║",
        f"║  OTP Code: {otp_code:<50}  ║",
        f"║  Purpose:  {purpose:<50}  ║",
        f"║  Expires:  5 minutes                                           ║",
        "╚════════════════════════════════════════════════════════════════╝",
        ""
    ]
    print("\n".join(box), flush=True)
    logger.info("[DEV MODE OTP] Email: %s | OTP: %s | Purpose: %s", recipient_email, otp_code, purpose)

def send_notification_email(subject: str, event_type: str, data: Dict[str, Any]) -> bool:
    """
    Sends an email notification via SMTP (or prints to terminal in Development Mode).
    """
    user, password = get_email_credentials()
    smtp_server, smtp_port = get_smtp_config()
    is_dev = is_development_mode()

    recipient_email = data.get("email")
    if not recipient_email:
        logger.error(f"Missing recipient email for event '{event_type}'. Cannot process notification.")
        return False

    # ── Development Mode Handling (No SMTP credentials required) ─────────────
    if not user or not password:
        if is_dev:
            if event_type == "otp":
                otp_code = str(data.get("otp", "000000"))
                purpose = str(data.get("purpose", "LOGIN"))
                print_dev_otp(recipient_email, otp_code, purpose)
            else:
                logger.info(
                    "[DEV MODE] Email notification for '%s' to '%s' logged to terminal (SMTP not configured).",
                    event_type, recipient_email
                )
            return True
        else:
            logger.error(
                "Production email delivery failed: EMAIL_USER / EMAIL_PASS not configured in environment."
            )
            return False

    # ── Live SMTP Delivery ──────────────────────────────────────────────────
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
        # In dev mode with credentials, also print to terminal for developer convenience
        if is_dev:
            print_dev_otp(recipient_email, str(data.get("otp", "")), str(data.get("purpose", "LOGIN")))
    else:
        logger.error(f"Unknown email event type: {event_type}")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"PREPRIA <{user}>"
    msg["To"] = recipient_email

    part = MIMEText(html_content, "html")
    msg.attach(part)

    try:
        logger.info("Connecting to SMTP server at %s:%d (recipient: %s)...", smtp_server, smtp_port, recipient_email)
        
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=15) as server:
                server.login(user, password)
                server.send_message(msg)
        else:
            with smtplib.SMTP(smtp_server, smtp_port, timeout=15) as server:
                server.starttls()
                server.login(user, password)
                server.send_message(msg)
                
        logger.info("Email '%s' successfully delivered to %s.", subject, recipient_email)
        return True
        
    except smtplib.SMTPAuthenticationError as auth_err:
        logger.error(
            "SMTP Authentication Error: Credentials for '%s' were rejected by %s. "
            "Details: %s",
            user, smtp_server, auth_err
        )
        if is_dev:
            # In development fallback, do not block the developer
            logger.info("[DEV MODE FALLBACK] Using terminal OTP output.")
            if event_type == "otp":
                print_dev_otp(recipient_email, str(data.get("otp", "")), str(data.get("purpose", "LOGIN")))
            return True
        return False
    except Exception as e:
        logger.error("SMTP delivery failure to %s: %s\n%s", recipient_email, e, traceback.format_exc())
        if is_dev:
            logger.info("[DEV MODE FALLBACK] Using terminal OTP output.")
            if event_type == "otp":
                print_dev_otp(recipient_email, str(data.get("otp", "")), str(data.get("purpose", "LOGIN")))
            return True
        return False
