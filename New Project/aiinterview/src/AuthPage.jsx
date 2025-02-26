import { useState } from "react";
import "./index.css";

import { Card, CardContent } from "./components/ui/Card";
import { Button } from "./components/ui/Button";
import { Input } from "./components/ui/Input";
import { Label } from "./components/ui/Label";

const BASE_URL = "http://127.0.0.1:8000"; // FastAPI Backend URL

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "", name: "" });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
    
        try {
            let apiUrl;
            let requestBody;
    
            if (showForgotPassword) {
                // 🔹 Handle Forgot Password Request
                apiUrl = `${BASE_URL}/forgot-password`;
                requestBody = { email: formData.email };
            } else if (isLogin) {
                // 🔹 Handle Login
                apiUrl = `${BASE_URL}/login`;
                requestBody = { email: formData.email, password: formData.password };
            } else {
                // 🔹 Handle Signup
                if (formData.password !== formData.confirmPassword) {
                    setMessage("❌ Passwords do not match!");
                    setLoading(false);
                    return;
                }
                apiUrl = `${BASE_URL}/users`;
                requestBody = { name: formData.name, email: formData.email, password: formData.password };
            }
    
            console.log("📡 Sending API request to:", apiUrl);
            console.log("Request body:", requestBody);
    
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });
    
            const data = await response.json();
            console.log("🔄 API Response:", data);
    
            if (!response.ok) {
                // Handle API errors
                throw new Error(data.detail || "Something went wrong");
            }
    
            if (showForgotPassword) {
                setMessage("✅ Reset link sent to your email!");
            } else if (isLogin) {
                alert("✅ Login successful");
                localStorage.setItem("uid_formatted", data.uid_formatted);  // Save uid_formatted to localStorage
                window.location.href = "/dashboard";  // Redirect to dashboard
            } else {
                alert("✅ Signup successful");
                setIsLogin(true);  // Switch back to login after successful signup
            }
        } catch (error) {
            // Handle errors and display a user-friendly message
            console.error("🚨 Error:", error);
            setMessage(error.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 p-4">
            <Card className="w-full max-w-md p-6 shadow-xl rounded-2xl bg-white">
                <CardContent>
                    <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                        {showForgotPassword ? "Forgot Password" : isLogin ? "Login" : "Sign Up"}
                    </h2>

                    {message && <p className="text-center text-red-600 mb-4">{message}</p>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && !showForgotPassword && (
                            <div>
                                <Label htmlFor="name" className="text-gray-700 font-medium">
                                    Name
                                </Label>
                                <Input
                                    className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        )}
                        <div>
                            <Label htmlFor="email" className="text-gray-700 font-medium">
                                Email
                            </Label>
                            <Input
                                className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {!showForgotPassword && (
                            <>
                                <div>
                                    <Label htmlFor="password" className="text-gray-700 font-medium">
                                        Password
                                    </Label>
                                    <Input
                                        className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                {!isLogin && (
                                    <div>
                                        <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                                            Confirm Password
                                        </Label>
                                        <Input
                                            className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                )}
                            </>
                        )}
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-all"
                            disabled={loading}
                        >
                            {loading ? "Processing..." : showForgotPassword ? "Send Reset Link" : isLogin ? "Login" : "Sign Up"}
                        </Button>
                        {isLogin && !showForgotPassword && (
                            <p className="text-sm text-center mt-4 text-gray-700">
                                Forgot your password?{" "}
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="text-blue-600 font-medium hover:underline"
                                >
                                    Reset Password
                                </button>
                            </p>
                        )}
                        {showForgotPassword && (
                            <p className="text-sm text-center mt-4 text-gray-700">
                                Remember your password?{" "}
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(false)}
                                    className="text-blue-600 font-medium hover:underline"
                                >
                                    Back to Login
                                </button>
                            </p>
                        )}
                        <p className="text-sm text-center mt-4 text-gray-700">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                            <button
                                type="button"
                                onClick={() => { setIsLogin(!isLogin); setShowForgotPassword(false); }}
                                className="text-blue-600 font-medium hover:underline"
                            >
                                {isLogin ? "Sign up" : "Login"}
                            </button>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}