import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    
    const { login, isLoggingIn } = useAuthStore();

    const handleFormSubmit = (e) => {
        e.preventDefault();
        login(formData);
    }

    const handleGuestCredentials = (e) => {
        e.preventDefault();
        try {
            setFormData({ email: "guest@gmail.com", password: "123456" });
            toast.success("Guest Credentials are set, please Sign in");
        } catch (error) {
            console.log("Unable to set guest credentials");
            toast.error("Unable to set guest credentials");
        }
    }

    return (
        <div className="h-screen grid lg:grid-cols-1">
            <div className="flex flex-col justify-center items-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-8 rounded-lg shadow-lg shadow-black backdrop-blur-3xl bg-white/20 px-6 py-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="flex flex-col items-center gap-2 group">
                        <div
                            className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                        >
                            {/* <MessageSquare className="w-6 h-6 text-primary" /> */}
                            <img src="/logo.png" alt="logo" />
                        </div>
                        <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
                        <p className="text-base-content/60">Sign in to your account</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Email</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-base-content/40" />
                            </div>
                            <input
                                type="email"
                                className={`input input-bordered w-full pl-10`}
                                placeholder="ex: you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        </div>

                        <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Password</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-base-content/40" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                className={`input input-bordered w-full pl-10`}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5 text-base-content/40" />
                            ) : (
                                <Eye className="h-5 w-5 text-base-content/40" />
                            )}
                            </button>
                        </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="btn btn-primary w-full"
                                disabled={isLoggingIn}
                            >
                            {isLoggingIn ? (
                                <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Loading...
                                </>
                            ) : (
                                "Sign in"
                            )}
                            </button>
                            <button
                                onClick={handleGuestCredentials}
                                className="btn btn-active w-full mt-2"
                            >
                                Get Guest User Credentials
                            </button>
                        </div>
                    </form>

                    <div className="text-center">
                        <p className="text-base-content/60">
                        Don&apos;t have an account?{" "}
                        <Link to="/signup" className="link link-primary">
                            Create account
                        </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
