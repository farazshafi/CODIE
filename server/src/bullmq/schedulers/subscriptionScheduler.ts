import subscriptionQueue from "../queues/subscriptionQueue";

const scheduleSubscriptionJobs = async () => {
  await subscriptionQueue.add(
    "applyDowngrade",
    {},
    {
      jobId: "applyDowngrade",
      repeat: { pattern: "0 1 * * *" }, // every day at 1 AM
    }
  );

  await subscriptionQueue.add(
    "sendExpiryReminder",
    {},
    {
      jobId: "sendExpiryReminder",
      repeat: { pattern: "0 1 * * *" },
    }
  );

  console.log("✅ Subscription jobs scheduled");
  process.exit(0);
};

scheduleSubscriptionJobs();
