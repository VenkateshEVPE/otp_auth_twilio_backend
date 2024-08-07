const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import CORS middleware
const app = express();
const port = 5000;

const accountSid = "AC5cd935b9119ab5a82db3ac6cde7db989";
const authToken = "8ea3f422236b925dc2aaf0992e156853";
const client = require("twilio")(accountSid, authToken); // Initialize Twilio client

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes
app.get("/", (req, res) => {
  res.send("hello world!");
});

function generateOTP() {
  const length = 6; // Length of the OTP
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return otp;
}

const otpStorage = {};

function sendOTP(phoneNumber, otp) {
  return client.messages.create({
    body: `Your OTP is ${otp}`,
    from: "+12298007356",
    to: "+91"+phoneNumber,
  });
}

app.post("/send-otp", async (req, res) => {
  const { phoneNumber } = req.body;
  console.log(typeof phoneNumber);
  console.log(phoneNumber);
  const otp = generateOTP();
  console.log(otp);
  otpStorage[phoneNumber] = otp;
  try {
    await sendOTP(phoneNumber, otp);
    
    res.status(200).send("OTP sent successfully");
  } catch (error) {
    res.status(500).send("Error sending OTP");
  }
});


app.post("/verify-otp", (req, res) => {
  console.log(otpStorage);
  const { phoneNumber, otp } = req.body;
  console.log(phoneNumber);
  console.log(otp);
  if (otpStorage[phoneNumber] === otp) {
    delete otpStorage[phoneNumber];
    res.status(200).send("OTP verified successfully");
  } else {
    res.status(400).send("Invalid OTP");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
