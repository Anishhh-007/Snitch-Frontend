import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useOrder from "../hook/useOrder";
import { useNavigate } from "react-router";

const PaymentSuccess = () => {

    const [search] = useSearchParams()
    const dataQuery = search.get('data')
    const [data, setData] = useState("")
    const { handelUpdateStatus } = useOrder()
    const navigate = useNavigate()


    const updateOrder = async () => {
        if (dataQuery) {
            try {
                const decodedData = atob(dataQuery);
                const parsedData = JSON.parse(decodedData);
                if (parsedData.status === 'COMPLETE') {
                    await handelUpdateStatus()
                }
                setData(parsedData);
            } catch (error) {
                console.error("Error decoding data:", error);
                setData("Error decoding data");
            }
        }
    }
    useEffect(() => {
        updateOrder()

    }, [dataQuery])


    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 px-4 py-10 text-zinc-900">
            <div className="mx-auto max-w-lg">
                <div className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-[0_20px_60px_rgba(34,197,94,0.12)]">
                    <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-500 px-6 py-8 text-white">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-2xl">
                            ✓
                        </div>
                        <p className="mt-4 text-xs uppercase tracking-[0.35em] text-white/75">
                            Payment Successful
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                            Your payment is complete
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-white/85">
                            The transaction was processed successfully through eSewa.
                        </p>
                    </div>

                    <div className="space-y-5 px-6 py-6">
                        {data?.error ? (
                            <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-red-700">
                                {data.error}
                            </div>
                        ) : (
                            <>
                                <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/80 p-5">
                                    <p className="text-sm font-medium text-emerald-700">
                                        Paid amount
                                    </p>
                                    <div className="mt-3 flex items-end gap-2">
                                        <span className="text-5xl font-semibold tracking-tight text-emerald-700">
                                            ₹{data?.total_amount || "0"}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs text-emerald-600">
                                        Thank you for your payment.
                                    </p>
                                </div>

                                <div className="rounded-[1.5rem] border border-zinc-100 bg-zinc-50 p-5">
                                    <h2 className="text-sm font-semibold text-zinc-900">
                                        Transaction details
                                    </h2>

                                    <div className="mt-4 space-y-3 text-sm">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-zinc-500">Status</span>
                                            <span className="font-semibold text-emerald-700">
                                                {data?.status || "N/A"}
                                            </span>
                                        </div>


                                    </div>
                                </div>

                                <div className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                            ✓
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-zinc-900">
                                                Payment confirmed
                                            </p>
                                            <p className="mt-1 text-sm leading-6 text-zinc-500">
                                                You can now return to the home page and continue using the app.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            onClick={() => navigate("/")}
                            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-700 to-green-600 px-5 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(22,163,74,0.25)] transition hover:from-emerald-800 hover:to-green-700 active:scale-[0.99]"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PaymentSuccess