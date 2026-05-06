import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Phone, ArrowRight, ShieldCheck, Star, Truck, User, Sparkles, Shirt } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "../hook/useAuth";

const Register = () => {
    const [fullname, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [contact, setContact] = useState("");
    const [password, setPassword] = useState("");
    const [isSeller, setIsSeller] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { handelRegister } = useAuth();

    const handleRegister = async (e) => {
        e.preventDefault();
        await handelRegister({ email, password, fullname, contact, isSeller });
    };

    return (
        <div className="min-h-screen bg-[#f6f3ee] text-zinc-900">
            <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">

                {/* ── LEFT PANEL ── */}
                <section className="hidden lg:flex flex-col justify-between border-r border-black/5 bg-[#f6f3ee] px-10 py-16">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase shadow-sm">
                            <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
                            New season collection
                        </div>

                        <div className="mt-8 grid gap-4">
                            {[
                                { icon: ShieldCheck, title: "Secure checkout", desc: "Built for safe and smooth shopping." },
                                { icon: Truck, title: "Fast dispatch", desc: "Seller-ready product browsing." },
                                { icon: Star, title: "Quality picks", desc: "Simple cards with premium presentation." },
                            ].map(({ icon: Icon, title, desc }) => (
                                <div key={title} className="rounded-[1.75rem] border border-black/5 bg-white p-5 shadow-sm">
                                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2e9dd] text-[#171717]">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
                                    <p className="mt-1 text-xs leading-6 text-zinc-500">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 pt-6">
                        <div>
                            <h2 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
                                Fresh styles for the everyday wardrobe.
                            </h2>
                            <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-500">
                                Discover curated products from Stnitch sellers. A simple shopping experience with a clean, familiar ecommerce feel.
                            </p>
                        </div>
                        <Link
                            to="/"
                            className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
                        >
                            Shop now
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>

                {/* ── RIGHT PANEL (form) ── */}
                <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
                    <div className="w-full max-w-md rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-8">

                        {/* Mobile logo */}
                        <div className="mb-8 flex items-center gap-3 lg:hidden">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2e9dd] text-[#171717]">
                                <Shirt className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">Stnitch</p>
                                <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Register</h1>
                            </div>
                        </div>

                        {/* Heading */}
                        <div className="mb-7 space-y-1.5">
                            <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">Stnitch</p>
                            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">Create account</h2>
                            <p className="text-sm leading-6 text-zinc-500">
                                Enter your details to start your journey with Stnitch.
                            </p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">

                            {/* Full name */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">Full name</label>
                                <div className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-[#faf8f5] px-4 py-3 transition focus-within:border-black/20 focus-within:bg-white">
                                    <User className="h-4 w-4 shrink-0 text-zinc-400 transition group-focus-within:text-zinc-600" />
                                    <input
                                        type="text"
                                        placeholder="Your full name"
                                        value={fullname}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">Email</label>
                                <div className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-[#faf8f5] px-4 py-3 transition focus-within:border-black/20 focus-within:bg-white">
                                    <Mail className="h-4 w-4 shrink-0 text-zinc-400 transition group-focus-within:text-zinc-600" />
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Contact */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">Contact</label>
                                <div className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-[#faf8f5] px-4 py-3 transition focus-within:border-black/20 focus-within:bg-white">
                                    <Phone className="h-4 w-4 shrink-0 text-zinc-400 transition group-focus-within:text-zinc-600" />
                                    <input
                                        type="tel"
                                        placeholder="Your phone number"
                                        value={contact}
                                        onChange={(e) => setContact(e.target.value)}
                                        className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">Password</label>
                                <div className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-[#faf8f5] px-4 py-3 transition focus-within:border-black/20 focus-within:bg-white">
                                    <Lock className="h-4 w-4 shrink-0 text-zinc-400 transition group-focus-within:text-zinc-600" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a strong password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="rounded-xl p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Seller toggle */}
                            <div className="rounded-2xl border border-black/10 bg-[#faf8f5] p-4">
                                <label className="flex cursor-pointer items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={isSeller}
                                        onChange={(e) => setIsSeller(e.target.checked)}
                                        className="mt-0.5 h-4 w-4 rounded border-black/20 accent-zinc-900"
                                    />
                                    <span className="space-y-0.5">
                                        <span className="block text-sm font-medium text-zinc-900">Register as seller</span>
                                        <span className="block text-xs leading-5 text-zinc-500">
                                            Enable this to create a seller account for listing products.
                                        </span>
                                    </span>
                                </label>
                                <input type="hidden" name="isSeller" value={isSeller ? "true" : "false"} />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="mt-1 w-full cursor-pointer rounded-2xl bg-[#171717] px-4 py-3 text-sm font-semibold text-white transition hover:bg-black active:scale-[0.99]"
                            >
                                Create account
                            </button>

                            {/* Divider */}
                            <div className="relative py-1">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-black/8" />
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                                    or
                                </div>
                            </div>

                            {/* Google */}
                            <a
                                href="/api/auth/google"
                                className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-black/10 bg-[#faf8f5] px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill="currentColor" d="M21.35 11.1h-9.18v2.98h5.27c-.23 1.4-.97 2.59-2.2 3.39v2.82h3.56c2.08-1.92 3.28-4.75 3.28-8.11 0-.76-.07-1.49-.19-2.08z" />
                                    <path fill="currentColor" d="M12.17 22c2.97 0 5.46-.98 7.28-2.67l-3.56-2.82c-.98.66-2.23 1.05-3.72 1.05-2.85 0-5.26-1.92-6.12-4.5H2.37v2.91A10 10 0 0 0 12.17 22z" />
                                    <path fill="currentColor" d="M6.05 13.06a5.99 5.99 0 0 1 0-3.82V6.33H2.37a10 10 0 0 0 0 8.91l3.68-2.18z" />
                                    <path fill="currentColor" d="M12.17 4.11c1.62 0 3.08.56 4.23 1.66l3.17-3.17C17.62.85 15.13 0 12.17 0A10 10 0 0 0 2.37 6.33l3.68 2.91c.86-2.58 3.27-5.13 6.12-5.13z" />
                                </svg>
                                Continue with Google
                            </a>
                        </form>

                        <p className="mt-6 text-center text-xs text-zinc-400">
                            Already have an account?{" "}
                            <Link to="/login" className="font-medium text-zinc-700 hover:text-zinc-900">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Register;