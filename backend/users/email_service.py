# users/email_service.py - EMAIL VERIFICATION SERVICE
import random
import string
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.core.cache import cache

class EmailVerificationService:
    """Service for sending verification codes via email"""
    
    @staticmethod
    def generate_code(length=6):
        """Generate a random 6-digit verification code"""
        return ''.join(random.choices(string.digits, k=length))
    
    @staticmethod
    def store_code(email, code, purpose='verification'):
        """Store verification code in cache for 10 minutes"""
        cache_key = f'{purpose}_{email}'
        cache.set(cache_key, code, timeout=600)  # 10 minutes
        return cache_key
    
    @staticmethod
    def verify_code(email, code, purpose='verification'):
        """Verify if the code matches the stored code"""
        cache_key = f'{purpose}_{email}'
        stored_code = cache.get(cache_key)
        
        if stored_code and stored_code == code:
            cache.delete(cache_key)  # Delete after successful verification
            return True
        return False
    
    @staticmethod
    def send_verification_email(email, code, user_name=None):
        """Send verification code email for registration"""
        subject = '🔐 ELD Compliance - Email Verification Code'
        
        html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f8fafc;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: 40px auto;
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
                    padding: 40px 30px;
                    text-align: center;
                    color: white;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                }}
                .header p {{
                    margin: 10px 0 0 0;
                    opacity: 0.9;
                    font-size: 16px;
                }}
                .content {{
                    padding: 40px 30px;
                }}
                .greeting {{
                    font-size: 18px;
                    color: #1e293b;
                    margin-bottom: 20px;
                }}
                .message {{
                    color: #475569;
                    margin-bottom: 30px;
                    font-size: 16px;
                }}
                .code-container {{
                    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
                    border-radius: 12px;
                    padding: 30px;
                    text-align: center;
                    margin: 30px 0;
                    border: 2px dashed #cbd5e1;
                }}
                .code {{
                    font-size: 42px;
                    font-weight: 800;
                    letter-spacing: 8px;
                    color: #2563eb;
                    font-family: 'Courier New', monospace;
                    margin: 10px 0;
                }}
                .code-label {{
                    font-size: 14px;
                    color: #64748b;
                    text-transform: uppercase;
                    font-weight: 600;
                    letter-spacing: 1px;
                }}
                .warning {{
                    background: #fef3c7;
                    border-left: 4px solid #f59e0b;
                    padding: 15px 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }}
                .warning p {{
                    margin: 0;
                    color: #92400e;
                    font-size: 14px;
                }}
                .footer {{
                    background: #f8fafc;
                    padding: 30px;
                    text-align: center;
                    border-top: 1px solid #e2e8f0;
                }}
                .footer p {{
                    margin: 5px 0;
                    color: #64748b;
                    font-size: 14px;
                }}
                .footer a {{
                    color: #2563eb;
                    text-decoration: none;
                }}
                .icon {{
                    font-size: 48px;
                    margin-bottom: 10px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="icon">🚛</div>
                    <h1>ELD Compliance System</h1>
                    <p>Email Verification</p>
                </div>
                
                <div class="content">
                    <div class="greeting">
                        Hello{' ' + user_name if user_name else ''}! 👋
                    </div>
                    
                    <div class="message">
                        Thank you for registering with ELD Compliance System. To complete your registration and verify your email address, please use the verification code below:
                    </div>
                    
                    <div class="code-container">
                        <div class="code-label">Your Verification Code</div>
                        <div class="code">{code}</div>
                        <div class="code-label">Valid for 10 minutes</div>
                    </div>
                    
                    <div class="message">
                        Enter this code in the verification page to activate your account. Once verified, your account will be reviewed by an administrator for approval.
                    </div>
                    
                    <div class="warning">
                        <p><strong>⚠️ Security Notice:</strong> If you didn't request this verification code, please ignore this email. Never share this code with anyone.</p>
                    </div>
                </div>
                
                <div class="footer">
                    <p><strong>ELD Compliance System</strong></p>
                    <p>FMCSA-Compliant Fleet Management</p>
                    <p style="margin-top: 15px;">
                        Need help? Contact us at <a href="mailto:support@eldcompliance.com">support@eldcompliance.com</a>
                    </p>
                    <p style="margin-top: 10px; font-size: 12px; color: #94a3b8;">
                        © 2024 ELD Compliance System. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        plain_message = f"""
        ELD Compliance System - Email Verification
        
        Hello{' ' + user_name if user_name else ''}!
        
        Your verification code is: {code}
        
        This code is valid for 10 minutes.
        
        If you didn't request this code, please ignore this email.
        
        © 2025 ELD Compliance System
        """
        
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                html_message=html_message,
                fail_silently=False,
            )
            return True
        except Exception as e:
            print(f"Error sending verification email: {e}")
            return False
    
    @staticmethod
    def send_password_reset_email(email, code, user_name=None):
        """Send password reset code email"""
        subject = '🔑 ELD Compliance - Password Reset Code'
        
        html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f8fafc;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: 40px auto;
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
                    padding: 40px 30px;
                    text-align: center;
                    color: white;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                }}
                .header p {{
                    margin: 10px 0 0 0;
                    opacity: 0.9;
                    font-size: 16px;
                }}
                .content {{
                    padding: 40px 30px;
                }}
                .greeting {{
                    font-size: 18px;
                    color: #1e293b;
                    margin-bottom: 20px;
                }}
                .message {{
                    color: #475569;
                    margin-bottom: 30px;
                    font-size: 16px;
                }}
                .code-container {{
                    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                    border-radius: 12px;
                    padding: 30px;
                    text-align: center;
                    margin: 30px 0;
                    border: 2px dashed #fca5a5;
                }}
                .code {{
                    font-size: 42px;
                    font-weight: 800;
                    letter-spacing: 8px;
                    color: #dc2626;
                    font-family: 'Courier New', monospace;
                    margin: 10px 0;
                }}
                .code-label {{
                    font-size: 14px;
                    color: #991b1b;
                    text-transform: uppercase;
                    font-weight: 600;
                    letter-spacing: 1px;
                }}
                .warning {{
                    background: #fef3c7;
                    border-left: 4px solid #f59e0b;
                    padding: 15px 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }}
                .warning p {{
                    margin: 0;
                    color: #92400e;
                    font-size: 14px;
                }}
                .footer {{
                    background: #f8fafc;
                    padding: 30px;
                    text-align: center;
                    border-top: 1px solid #e2e8f0;
                }}
                .footer p {{
                    margin: 5px 0;
                    color: #64748b;
                    font-size: 14px;
                }}
                .footer a {{
                    color: #2563eb;
                    text-decoration: none;
                }}
                .icon {{
                    font-size: 48px;
                    margin-bottom: 10px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="icon">🔑</div>
                    <h1>Password Reset Request</h1>
                    <p>ELD Compliance System</p>
                </div>
                
                <div class="content">
                    <div class="greeting">
                        Hello{' ' + user_name if user_name else ''}! 👋
                    </div>
                    
                    <div class="message">
                        We received a request to reset your password for your ELD Compliance System account. Use the verification code below to proceed with resetting your password:
                    </div>
                    
                    <div class="code-container">
                        <div class="code-label">Your Reset Code</div>
                        <div class="code">{code}</div>
                        <div class="code-label">Valid for 10 minutes</div>
                    </div>
                    
                    <div class="message">
                        Enter this code on the password reset page, then create your new password. Make sure to choose a strong password that you haven't used before.
                    </div>
                    
                    <div class="warning">
                        <p><strong>⚠️ Security Alert:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure. Your password will not be changed unless you complete the reset process.</p>
                    </div>
                </div>
                
                <div class="footer">
                    <p><strong>ELD Compliance System</strong></p>
                    <p>FMCSA-Compliant Fleet Management</p>
                    <p style="margin-top: 15px;">
                        Need help? Contact us at <a href="mailto:support@eldcompliance.com">support@eldcompliance.com</a>
                    </p>
                    <p style="margin-top: 10px; font-size: 12px; color: #94a3b8;">
                        © 2024 ELD Compliance System. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        plain_message = f"""
        ELD Compliance System - Password Reset
        
        Hello{' ' + user_name if user_name else ''}!
        
        Your password reset code is: {code}
        
        This code is valid for 10 minutes.
        
        If you didn't request a password reset, please ignore this email.
        
        © 2025 ELD Compliance System
        """
        
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                html_message=html_message,
                fail_silently=False,
            )
            return True
        except Exception as e:
            print(f"Error sending password reset email: {e}")
            return False
