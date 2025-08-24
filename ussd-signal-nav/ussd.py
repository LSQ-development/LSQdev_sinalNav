from flask import Flask, request
import africastalking
import os

app = Flask(__name__)

# Initialize Africa's Talking
username = "sandbox"   # use "sandbox" for development
api_key = "atsk_1ddfe4fd0bb75cbe0a375d734fb3a6eac571fc4be5331f123e418679e1ade9979febf258"   # replace with your API key from Africa's Talking
africastalking.initialize(username, api_key)

# You can now access services like SMS, USSD, Payments, etc.
sms = africastalking.SMS  # Example if you want to send SMS later

@app.route('/', methods=['POST', 'GET'])
def ussd_callback():
    session_id = request.values.get("sessionId", None)
    service_code = request.values.get("serviceCode", None)
    phone_number = request.values.get("phoneNumber", None)
    text = request.values.get("text", "")

    # Main menu
    if text == "":
        response = "CON Recommanded nearest location:\n"
        response += "1. UWC Library / Mayibuye Archives\n"
        response += "2. Education Building"
    elif text == "1":
        response = "END You selected: UWC Library / Mayibuye Archives"
    elif text == "2":
        response = "END You selected: Education Building"
    else:
        response = "END Invalid option. Please try again."

    return response

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=os.environ.get("PORT", 5000))
