import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        console.log("🔍 Extracted Token from URL:", token);
    }, [token]);

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        if (!token) {
            setMessage("❌ Invalid or missing reset token.");
            setLoading(false);
            return;
        }

        // Client-side password validation
        if (password.length < 8) {
            setMessage("❌ Password must be at least 8 characters long.");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setMessage("❌ Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            console.log("📡 Sending API request...");
            const response = await fetch("http://localhost:8000/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();
            console.log("🔄 API Response:", data);

            if (response.ok) {
                setMessage("✅ Password reset successful! Redirecting to login...");
                setTimeout(() => navigate("/login"), 3000);
            } else {
                setMessage(`❌ ${typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail) || "Something went wrong."}`);
            }
        } catch (error) {
            console.error("🚨 Network error:", error);
            setMessage("❌ Error connecting to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            maxWidth: "400px",
            margin: "auto",
            padding: "20px",
            textAlign: "center",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#f9f9f9",
        }}>
            <h2>🔑 Reset Password</h2>
            {token ? (
                <form onSubmit={handleReset}>
                    {/* Password Input */}
                    <div style={{ position: "relative", marginBottom: "10px" }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            style={{
                                padding: "10px",
                                width: "100%",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>

                    {/* Confirm Password Input */}
                    <div style={{ position: "relative", marginBottom: "10px" }}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading}
                            style={{
                                padding: "10px",
                                width: "100%",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            {showConfirmPassword ? "🙈" : "👁️"}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: "10px",
                            width: "100%",
                            backgroundColor: loading ? "#ccc" : "#007bff",
                            color: "#fff",
                            border: "none",
                            borderRadius: "5px",
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? "Processing..." : "Reset Password"}
                    </button>
                </form>
            ) : (
                <p style={{ color: "red", fontWeight: "bold" }}>❌ Invalid or missing reset token.</p>
            )}
            {message && <p style={{ marginTop: "10px", fontWeight: "bold" }}>{message}</p>}
        </div>
    );
};

export default ResetPassword;
