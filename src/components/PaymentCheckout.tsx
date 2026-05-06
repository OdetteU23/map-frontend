//Checkout forms for payments
import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { api } from '../helpers/data/fetchData';

interface PaymentCheckoutProps {
    amount: number;
    bookingId: number;
    userId: number;
    onPaymentSuccess?: (paymentId: number) => void;
    onPaymentError?: (error: string) => void;
}

const styles = {
    form: {
        width: '100%',
        maxWidth: '400px',
        margin: 'auto',
    },
    cardElement: {
        base: {
            fontSize: '16px',
            color: '#32325d',
        },
    },
    submitButton: {
        marginTop: '16px',
        padding: '10px 15px',
        backgroundColor: '#5cb85c',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        width: '100%',
    },
    disabledButton: {
        backgroundColor: '#b3b3b3',
        cursor: 'not-allowed',
    },
    error: {
        color: 'red',
        marginTop: '8px',
    },
    success: {
        color: 'green',
        marginTop: '8px',
    },
    amount: {
        fontSize: '18px',
        fontWeight: 'bold' as const,
        marginBottom: '16px',
    },
};

const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({ amount, bookingId, userId, onPaymentSuccess, onPaymentError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements || isProcessing) return;

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) return;

        setIsProcessing(true);
        setPaymentError(null);
        setPaymentSuccess(null);

        try {
            // 1. Create PaymentIntent on our backend
            const { clientSecret, payment } = await api.auth.createPaymentIntent({
                amount,
                currency: 'eur',
                booking_id: bookingId,
                user_id: userId,
            });

            // 2. Confirm the payment with Stripe
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: cardElement },
            });

            if (error) {
                setPaymentError(error.message || 'Maksu epäonnistui. Yritä uudestaan.');
                onPaymentError?.(error.message || 'Payment failed');
            } else if (paymentIntent?.status === 'succeeded') {
                // 3. Update payment status on backend
                await api.auth.updatePaymentStatus(payment.id, 'completed');
                setPaymentSuccess('Maksu hyväksytty!');
                onPaymentSuccess?.(payment.id);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Maksu epäonnistui. Yritä uudestaan.';
            setPaymentError(message);
            onPaymentError?.(message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <p style={styles.amount}>Summa: {amount.toFixed(2)} €</p>
            <CardElement options={{ style: styles.cardElement }} />
            <button
                type="submit"
                disabled={!stripe || isProcessing}
                style={{
                    ...styles.submitButton,
                    ...(!stripe || isProcessing ? styles.disabledButton : {}),
                }}
            >
                {isProcessing ? 'Käsitellään...' : 'Maksa'}
            </button>
            {paymentSuccess && <p style={styles.success}>{paymentSuccess}</p>}
            {paymentError && <p style={styles.error}>{paymentError}</p>}
        </form>
    );
};

export default PaymentCheckout;