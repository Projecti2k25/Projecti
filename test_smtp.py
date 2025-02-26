import smtplib

def test_smtp():
    try:
        # Replace these with your Gmail credentials
        sender_email = "projecti2k25@gmail.com"  # Your Gmail address
        sender_password = "ydymknqqbywgjmgm"  # Your Gmail App Password
        smtp_server = "smtp.gmail.com"
        smtp_port = 587

        # Test SMTP connection
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  # Secure the connection
            server.login(sender_email, sender_password)
            print("SMTP login successful!")
    except Exception as e:
        print(f"SMTP login failed: {str(e)}")

# Run the test
test_smtp()