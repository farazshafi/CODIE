import subscriptionQueue from "../queues/subscriptionQueue";

export const scheduleSubscriptionJobs = () => {
  subscriptionQueue.add(
    "applyDowngrade",
    {},
    {
      repeat: {
        pattern: "0 1 * * *", // Every day at 1 AM
      },
    }
  );

  subscriptionQueue.add(
    "sendExpiryReminder",
    {},
    {
      repeat: {
        pattern: "0 1 * * *", // Every day at 1 AM
      },
    }
  );

  console.log("Subscription jobs scheduled");
};
