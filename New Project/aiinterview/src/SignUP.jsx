import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setMessage("");

        // Validate Confirm Password
        if (password !== confirmPassword) {
            setMessage("❌ Passwords do not match!");
            return;
        }

        // Check password length
        if (password.length < 8) {
            setMessage("❌ Password must be at least 8 characters long.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://localhost:8000/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),  // Send only `password`
            });

            const data = await response.json();
            if (response.ok) {
                setMessage("✅ Signup successful! Redirecting to login...");
                setTimeout(() => navigate("/login"), 3000);
            } else {
                setMessage(`❌ ${data.detail || "Something went wrong."}`);
            }
        } catch (error) {
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
            <h2>📝 Sign Up</h2>
            <form onSubmit={handleSignUp}>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{ padding: "10px", marginBottom: "10px", width: "100%", borderRadius: "5px", border: "1px solid #ccc" }}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: "10px", marginBottom: "10px", width: "100%", borderRadius: "5px", border: "1px solid #ccc" }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: "10px", marginBottom: "10px", width: "100%", borderRadius: "5px", border: "1px solid #ccc" }}
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ padding: "10px", marginBottom: "10px", width: "100%", borderRadius: "5px", border: "1px solid #ccc" }}
                />
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
                    {loading ? "Processing..." : "Sign Up"}
                </button>
            </form>
            {message && <p style={{ marginTop: "10px", fontWeight: "bold" }}>{message}</p>}
        </div>
    );
};

export default SignUp;