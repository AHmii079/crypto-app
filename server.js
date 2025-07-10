const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post('/send-payment-email', async (req, res) => {
  try {
    const { paymentMethod, walletAddress } = req.body;
    
    // Configure your email transport (use your real credentials)
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'saqiniazibrand@gmail.com', // replace with your Gmail
        pass: 'awnq qjlq nfig fzhv' // replace with your Gmail App Password
      }
    });

    let mailOptions = {
      from: 'saqiniazibrand@gmail.com', // sender address
      to: 'admin@otcsoftware.com', // receiver
      subject: 'Payment Confirmation',
      text: `Payment received via ${paymentMethod}. Wallet address: ${walletAddress}. Please verify the payment and activate the software.`,
      html: `
        <h2>Payment Confirmation</h2>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <p><strong>Wallet Address:</strong> ${walletAddress}</p>
        <p>Please verify the payment and activate the software for the user.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
