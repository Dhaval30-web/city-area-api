const nodemailer = require('nodemailer');
const twilio = require('twilio');

// OTP Generate
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email OTP
const sendEmailOtp = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: `"Charbhuja Store" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your OTP - Charbhuja Store',
        html: `
            <div style="font-family: Arial; padding: 20px; background: #f4f4f4;">
                <div style="background: #6f5a8e; padding: 20px; border-radius: 10px; text-align: center;">
                    <h2 style="color: #fff;">Charbhuja Store</h2>
                </div>
                <div style="background: #fff; padding: 30px; border-radius: 10px; margin-top: 10px; text-align: center;">
                    <h3>Your OTP Code</h3>
                    <p style="font-size: 36px; font-weight: bold; color: #6f5a8e; letter-spacing: 8px;">${otp}</p>
                    <p style="color: #888;">Valid for 10 minutes only.</p>
                </div>
            </div>
        `
    });
};

// SMS OTP
const sendSmsOtp = async (phone, otp) => {
    const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
        body: `Your Charbhuja Store OTP is: ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE,
        to: phone
    });
};

module.exports = { generateOtp, sendEmailOtp, sendSmsOtp };