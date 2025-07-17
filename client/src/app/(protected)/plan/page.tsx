
import Subscription from '@/components/Subscription';
import PageTransitionWrapper from '@/components/TransitionWrapper';
import Navbar from '@/components/ui/navbar';

export const getSubscriptions = async () => {
    const backendUrl = process.env.API_BASE_URL!;

    try {
        const res = await fetch(`${backendUrl}/subscription/active`, { cache: "no-cache" });

        if (!res.ok) {
            console.error("Backend responded with:", res.status);
            return [];
        }

        const data = await res.json();
        return data;

    } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
        return [];
    }
};

const Page = async () => {
    const subscriptions = await getSubscriptions();

    const hasPlans = Array.isArray(subscriptions) && subscriptions.length > 0;

    return (
        <>
            <Navbar />
            <PageTransitionWrapper>
                {hasPlans ? (
                    <Subscription plan={subscriptions} />
                ) : (
                    <div className="text-center text-white py-10">
                        <h2 className="text-2xl">No subscription plans available.</h2>
                        <p className="text-gray-400 mt-2">Please try again later.</p>
                    </div>
                )}
            </PageTransitionWrapper>
        </>
    );
};

export default Page;