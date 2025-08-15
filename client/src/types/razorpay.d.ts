interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name?: string;
    description?: string;
    order_id?: string;
    handler?: (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    theme?: {
        color?: string;
    };
}

interface RazorpayPaymentFailedResponse {
    error: {
        code: string;
        description: string;
        source: string;
        step: string;
        reason: string;
        metadata: {
            order_id: string;
            payment_id: string;
        };
    };
}

interface RazorpayInstance {
    open(): void;
    on(event: "payment.failed", handler: (response: RazorpayPaymentFailedResponse) => void): void;
}

interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
}
