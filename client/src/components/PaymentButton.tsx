"use client"
import { verifySubscriptionApi, subscribeToPlanApi, getUserSubscriptionApi, downgradeToFreePlanApi, saveFailedPaymentApi } from '@/apis/userSubscriptionApi';
import { useMutationHook } from '@/hooks/useMutationHook';
import { useUserStore } from '@/stores/userStore';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import ConfirmationModal from './ConfirmationModal';
import Loading from './Loading';

type PaymentBtnProps = { amount: number, currency: string, planId: string, planName: string }

const PaymentButton = ({ amount, currency, planId, planName }: PaymentBtnProps) => {

  const user = useUserStore((state) => state.user)
  const userSubscription = useUserStore((state) => state.subscription)
  const setSubscription = useUserStore((state) => state.setSubscription)

  const [isModalOpen, setIsModalOpen] = useState(false)

  const { isLoading: subscriptionLoading, mutate: getSubscription } = useMutationHook(getUserSubscriptionApi, {
    onSuccess(res) {
      setSubscription(res)
    }
  })

  const { isLoading: verifing, mutate: verifySubscription } = useMutationHook(verifySubscriptionApi, {
    onSuccess(data) {
      getSubscription(user?.id)
      setIsModalOpen(false)
      toast.success(data.message)
    },
    onError(error) {
      console.log(error)
      toast.error(error.message || "Server error while verifying subscription")
    },
  })

  const { isLoading: downgrading, mutate: downgradeToFreePlan } = useMutationHook(downgradeToFreePlanApi, {
    onSuccess(data) {
      getSubscription(user?.id)
      toast.success(data.message)

    }
  })

  const { isLoading: savingFailedPayment, mutate: saveFailedPayment } = useMutationHook(saveFailedPaymentApi, {
    onSuccess(data) {
      toast.info(data.message)

    }
  })

  const { isLoading: subscribing, mutate: subscribe } = useMutationHook(subscribeToPlanApi, {
    onSuccess(data) {
      try {
        const { id: order_id, amount, currency } = data
        const options: RazorpayOptions = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
          amount,
          currency,
          name: "<CODIE> Online collabrative code editor",
          description: "Test transaction",
          order_id: order_id,
          handler: (response: { razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string }) => {
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user?.id,
              planId,
              amount
            }
            verifySubscription(verifyData)
          },
          prefill: {
            name: "John Doe",
            email: "john.doe@example.com",
            contact: "9999999999",
          },
          theme: {
            color: "#1bf07c",
          },
        }

        const paymentObject = new window.Razorpay(options);


        paymentObject.on('payment.failed', function (response: RazorpayPaymentFailedResponse) {
          const { payment_id } = response.error.metadata;

          console.log("Payment failed", response);

          toast.error("Payment failed. Please try again.");

          saveFailedPayment({
            userId: user?.id,
            planId: planId,
            razorpayId: payment_id,
            amount
          })
        });



        paymentObject.open();
      } catch (error) {
        console.log("Payment initationj failed", error)
      }

    },
    onError(error) {
      console.log(error)
      toast.error("Server error, failed to subscribe", error.description)
    },
  })

  const handlePayment = () => {

    if (userSubscription?.nextPlanId) {
      toast.info(`You've already scheduled a downgrade to the Basic Plan. This change will take effect on ${userSubscription.endDate}`)
      return
    }

    // upgrading
    if (userSubscription && userSubscription?.pricePerMonth < amount) {
      setIsModalOpen(true)
      return
    }
    // downgrading
    if (userSubscription && userSubscription?.pricePerMonth > amount && planName !== "Free") {
      setIsModalOpen(true)
      return
    }
    // renewing
    if (userSubscription?.id === planId) {
      subscribe({ amount, currency })

      return
    }

    if (amount < 1) {

      if (userSubscription && planId === userSubscription.id) {
        return
      }
      downgradeToFreePlan({ userId: user?.id })
      return
    }
    subscribe({ amount, currency })
  }

  const doPayment = () => {
    subscribe({ amount, currency })
  }

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (subscribing || verifing || downgrading || savingFailedPayment || subscriptionLoading) {
    if (subscribing) return <Loading fullScreen={true} text='Subscribing...' />
    if (verifing) return <Loading fullScreen={true} text='Verifing...' />
    if (downgrading) return <Loading fullScreen={true} text='Downgrading...' />
    if (savingFailedPayment) return <Loading fullScreen={true} text='Saving Failed Payment...' />
    if (subscriptionLoading) return <Loading text='Fetching Subscriptions...' />
  }

  return (
    <>
      <button
        onClick={handlePayment}
        className={`${planId === userSubscription?.id && amount < 1 ? "bg-gray-700 cursor-not-allowed" : "bg-green-500 rounded hover:bg-green-700 cursor-pointer"} py-2`}>
        {planId === userSubscription?.id && amount < 1 ? "Current Plan"
          : planId === userSubscription?.id ? "Renewal"
            : Number(amount) > Number(userSubscription?.pricePerMonth) ? "Upgrade"
              : "Downgrade"}
      </button>

      {userSubscription && (

        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={doPayment}
          content={
            userSubscription?.pricePerMonth < amount ? (
              <p>
                You&apos;re upgrading to a higher plan. <strong>No refunds</strong> will be issued if you proceed.
                The new premium features will become available <strong>only after your current plan expires</strong>.Do you still want to continue?
              </p>
            ) : userSubscription?.pricePerMonth > amount ? (
              <p>
                You&apos;re downgrading your subscription. <strong>New limitations will apply</strong> after your current plan ends.Are you sure you want to downgrade?
              </p>
            ) : (
              <p>Are you sure you want to continue with this action?</p>
            )
          }

        />
      )}
    </>
  )
}

export default PaymentButton