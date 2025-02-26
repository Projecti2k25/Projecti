const express = require("express");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express(); // ✅ Initialize app first

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(bodyParser.json());

// Fake database (Replace with real DB)
let users = [{ email: "test@example.com", password: "hashed_password", resetToken: "123456" }];

// Reset Password Route
app.post("/api/reset-password", async (req, res) => {
    const { token, password } = req.body;

    // Find user by reset token
    const user = users.find((u) => u.resetToken === token);
    if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash new password
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword; // Update password in DB
        user.resetToken = null; // Clear reset token

        res.json({ message: "Password reset successful! You can now log in." });
    } catch (error) {
        res.status(500).json({ message: "Error hashing password" });
    }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
