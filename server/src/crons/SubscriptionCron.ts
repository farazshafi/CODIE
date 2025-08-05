import cron from "node-cron"
import { IUserSubscriptionService } from "../services/interface/IUserSubscriptionService"

export class SubscriptionCron {
    constructor(
        private userSubscriptionService: IUserSubscriptionService
    ) { }
    start() {
        cron.schedule("0 1 * * *", async () => {
            try {
                await this.userSubscriptionService.applyDowngrade();

                await this.userSubscriptionService.sendExpiryReminder();
            } catch (err) {
                console.error("SubscriptionCron failed:", err);
            }

        })
    }
}