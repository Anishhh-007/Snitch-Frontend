import { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";
import useOrder from "../hook/useOrder";
import toast from "react-hot-toast";

const AmountForm = () => {
    const { variantId, productId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { handelCreateOrder } = useOrder();

    const formRef = useRef(null);

    const priceAmount = Number(location?.state?.price?.amount) || 0;
    const access = location?.state?.access;
    const [formData, setFormData] = useState({
        amount: priceAmount,
        tax_amount: "0",
        total_amount: priceAmount,
        transaction_uuid: uuidv4(),
        product_code: "EPAYTEST",
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: `https://localhost:5173/success`,
        failure_url: `https://localhost:5173/failure`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
    });

    const generateSignature = (total_amount, transaction_uuid, product_code) => {
        const data = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
        const secret = "8gBm/:&EnhH.1/q";
        const hashString = CryptoJS.HmacSHA256(data, secret);
        const hashedSignature = CryptoJS.enc.Base64.stringify(hashString);
        return hashedSignature;
    };

    useEffect(() => {
        const { total_amount, transaction_uuid, product_code } = formData;
        const hashedSignature = generateSignature(
            total_amount,
            transaction_uuid,
            product_code
        );
        setFormData((prev) => ({ ...prev, signature: hashedSignature }));
    }, [formData.amount, formData.total_amount]);

    const handlePaymentStatus = async (e) => {
        e.preventDefault();

        if (formData.amount <= 0) {
            toast.error("Invalid amount. Please return to the cart and try again.")
            return;
        }

        try {
            const res = await handelCreateOrder(productId, variantId, location?.state?.price, access);
            if (!res || res.success === false) {
                return;
            }
            if (formRef.current) {
                formRef.current.submit();
            }
        } catch (error) {
            toast.error(error?.response?.data?.message)
            navigate("/")
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 px-4 py-10 text-zinc-900">
            <div className="mx-auto max-w-lg">
                <div className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-[0_20px_60px_rgba(34,197,94,0.12)]">
                    <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-500 px-6 py-6 text-white">
                        <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-white/90">
                            eSewa Payment
                        </div>

                        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
                            Confirm your payment
                        </h1>

                        <p className="mt-2 max-w-md text-sm leading-6 text-white/85">
                            Review the amount below and continue to eSewa to complete your checkout.
                        </p>
                    </div>

                    <div className="space-y-5 px-6 py-6">
                        <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/80 p-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-emerald-700">
                                        Payable amount
                                    </p>
                                    <p className="mt-1 text-xs text-emerald-600">
                                        Secure checkout through eSewa
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-white px-4 py-2 shadow-sm">
                                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                                        NPR
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 flex items-end gap-2">
                                <span className="text-5xl font-semibold tracking-tight text-emerald-700">
                                    ₹{formData.amount}
                                </span>
                            </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                <p className="text-sm font-semibold text-amber-800">
                                    Testing mode only
                                </p>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-amber-800">
                                This is only for testing. No real money will be transacted.
                                The payment will use the eSewa test gateway.
                            </p>

                            <div className="mt-4 rounded-2xl border border-amber-200 bg-white/60 p-4 text-sm text-amber-900">
                                <div className="flex items-center justify-between py-1">
                                    <span className="font-medium">eSewa ID</span>
                                    <span className="font-semibold">9806800001</span>
                                </div>
                                <div className="flex items-center justify-between py-1">
                                    <span className="font-medium">MPIN</span>
                                    <span className="font-semibold">1122</span>
                                </div>
                                <div className="flex items-center justify-between py-1">
                                    <span className="font-medium">Token</span>
                                    <span className="font-semibold">123456</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-emerald-100 bg-white p-4 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                    ✓
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-zinc-900">
                                        Ready to proceed
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-zinc-500">
                                        You will be redirected to the eSewa gateway after confirmation.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form
                            ref={formRef}
                            action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
                            method="POST"
                            target="_top"
                        >
                            <input type="hidden" name="amount" value={formData.amount} />
                            <input type="hidden" name="tax_amount" value={formData.tax_amount} />
                            <input type="hidden" name="total_amount" value={formData.total_amount} />
                            <input
                                type="hidden"
                                name="transaction_uuid"
                                value={formData.transaction_uuid}
                            />
                            <input type="hidden" name="product_code" value={formData.product_code} />
                            <input
                                type="hidden"
                                name="product_service_charge"
                                value={formData.product_service_charge}
                            />
                            <input
                                type="hidden"
                                name="product_delivery_charge"
                                value={formData.product_delivery_charge}
                            />
                            <input type="hidden" name="success_url" value={formData.success_url} />
                            <input type="hidden" name="failure_url" value={formData.failure_url} />
                            <input
                                type="hidden"
                                name="signed_field_names"
                                value={formData.signed_field_names}
                            />
                            <input type="hidden" name="signature" value={formData.signature} />

                            <button
                                onClick={handlePaymentStatus}
                                type="button"
                                className="inline-flex cursor-pointer w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-700 to-green-600 px-5 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(22,163,74,0.25)] transition hover:from-emerald-800 hover:to-green-700 active:scale-[0.99]"
                            >
                                Pay with eSewa
                            </button>
                        </form>

                        <div className="rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-xs leading-5 text-zinc-500">
                            This page is for payment confirmation only. Amount, order creation, and
                            gateway redirection will happen after you continue.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AmountForm;