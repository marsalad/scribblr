from os.path import join, dirname
from dotenv import load_dotenv
from os import environ
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

cards = ['Reading is fundamental', 'We need to increase education funding']

html_template='''
<html>
<head>
<style>
.card {{
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    transition: 0.3s;
}}

.card:hover {{
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
}}

.container {{
    padding: 2px 16px;
}}
</style>
</head>
<body>
{}
</body>
</html>
'''

card_template = """
<div class="card">
  <div class="container">
    <h4><b>{}</b></h4> 
    <p>{}</p> 
  </div>
</div>
"""

def send_email(server, to, subject, text, html):
    msg = MIMEMultipart('alternative')
    msg.attach(MIMEText(text, 'text'))
    msg.attach(MIMEText(html, 'html'))
    msg['Subject'] = subject
    msg['To'] = to
    server.sendmail('Scribblr', to, msg.as_string())

def send_cards(cards, emails):
    cards_html = ''
    server = smtplib.SMTP(environ.get("SMTP_URL"))
    server.starttls()
    server.login(environ.get("EMAIL_USER"), environ.get("EMAIL_PASSWORD"))
    for card in cards:
        cards_html += card_template.format('card', card)
    for email in emails:
        text = '\n'.join(cards)
        html = html_template.format(cards_html)
        send_email(server, email, 'Meeting', text, html)
 
#send_cards('', ['michelkerlin@gmail.com'])
