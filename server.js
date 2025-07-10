const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const PASSWORDS_FILE = path.join(__dirname, 'passwords.json');

// Helper to read password hashes
function getPasswords() {
  const data = fs.readFileSync(PASSWORDS_FILE, 'utf-8');
  return JSON.parse(data).passwords; // array of hashes
}

// Helper to write password hashes
function setPasswords(passwords) {
  fs.writeFileSync(PASSWORDS_FILE, JSON.stringify({ passwords }, null, 2));
}

app.post('/send-payment-email', async (req, res) => {
  try {
    const { paymentMethod, walletAddress } = req.body;
    
    // Configure your email transport (use your real credentials)
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ztsteam000@gmail.com', // replace with your Gmail
        pass: 'aukb injr sozb laul' // replace with your Gmail App Password
      }
    });

    let mailOptions = {
      from: 'ztsteam000@gmail.com', // sender address
      to: 'fatimahamid711@gmail.com', // receiver
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

// Validate password endpoint
app.post('/validate-password', async (req, res) => {
  const { password } = req.body;
  const hashes = getPasswords();
  const valid = await Promise.any(
    hashes.map(hash => bcrypt.compare(password, hash))
  ).catch(() => false);
  res.json({ valid: !!valid });
});

// Admin: Get all passwords
app.get('/admin/passwords', (req, res) => {
  res.json({ passwords: getPasswords() });
});

// Admin: Add password (hash it)
app.post('/admin/passwords', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: 'Password required' });
  const hashes = getPasswords();
  const hash = await bcrypt.hash(password, 10);
  hashes.push(hash);
  setPasswords(hashes);
  res.json({ passwords: hashes });
});

// Admin: Update password (replace hash)
app.put('/admin/passwords', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  let hashes = getPasswords();
  let idx = -1;
  for (let i = 0; i < hashes.length; i++) {
    if (await bcrypt.compare(oldPassword, hashes[i])) {
      idx = i;
      break;
    }
  }
  if (idx === -1) return res.status(404).json({ message: 'Old password not found' });
  const newHash = await bcrypt.hash(newPassword, 10);
  hashes[idx] = newHash;
  setPasswords(hashes);
  res.json({ passwords: hashes });
});

// Admin: Delete password (by matching hash)
app.delete('/admin/passwords', async (req, res) => {
  const { password } = req.body;
  let hashes = getPasswords();
  hashes = await Promise.all(hashes.map(async h => (await bcrypt.compare(password, h) ? null : h)));
  hashes = hashes.filter(Boolean);
  setPasswords(hashes);
  res.json({ passwords: hashes });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
