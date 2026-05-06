import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, LogOut, ScrollText, ShoppingCart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/hook/useAuth";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const Navbar = ({ role, status }) => {
    const navigate = useNavigate();
    const [logout, setLogout] = useState(false);
    const { handelLogout } = useAuth()
    const [state, setState] = useState(false)
    const cartCount = useSelector((state) => state.auth.cartCount)
    const user = useSelector((state) => state.auth.user)

    const handleLogout = async () => {
        try {
            setState(true)
            const res = await handelLogout()
        } catch (error) {
            toast.error(error?.response?.data?.message)
        } finally {
            setState(false)
            setLogout(false)
            navigate('/login')
        }
    }


    return (
        (user && <> <header className="border-b border-black/5 bg-[#111111] text-white shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2e9dd] text-[#171717] shadow-sm">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="leading-tight">
                        <p className="text-xs uppercase tracking-[0.35em] text-white/45">Stnitch</p>
                        <h1 className="text-lg font-semibold">Product details</h1>
                    </div>
                </div>

                <nav className="flex items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 sm:px-4 sm:py-2.5 sm:text-sm"
                    >
                        <Home className="h-4 w-4" />
                        Home
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/cart")}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 sm:px-4 sm:py-2.5 sm:text-sm"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        Cart
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/orders")}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 sm:px-4 sm:py-2.5 sm:text-sm"
                    >
                        <ScrollText className="h-4 w-4" />
                        Orders
                    </button>
                    {role === "seller" && (
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 sm:px-4 sm:py-2.5 sm:text-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Dashboard
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setLogout(true)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 sm:px-4 sm:py-2.5 sm:text-sm"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </nav>
            </div>

        </header>
            {logout && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-sm rounded-2xl border border-white/20 bg-white p-6 shadow-2xl">
                        <h2 className="text-lg font-semibold text-zinc-900">Logout</h2>
                        <p className="mt-2 text-sm leading-6 text-zinc-600">
                            Are you sure you want to logout?
                        </p>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setLogout(false)}
                                className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={state}
                                type="button"
                                onClick={handleLogout}
                                className="cursor-pointer rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                            >
                                {state ? "Logging out..." : " Logout"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>)

    );
};

export default Navbar;