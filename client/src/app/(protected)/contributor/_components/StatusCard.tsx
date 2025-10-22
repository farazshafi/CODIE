import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        positive: boolean;
    };
}

export const StatsCard = ({ title, value, icon: Icon, trend }: StatsCardProps) => {
    return (
        <Card className="group bg-tertiary transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-3xl font-bold text-white">{value}</p>
                        {trend && (
                            <p
                                className={`text-sm font-medium ${trend.positive ? "text-green-600" : "text-red-500"
                                    }`}
                            >
                                {trend.positive ? "+" : ""}
                                {trend.value}% from last month
                            </p>
                        )}
                    </div>
                    <div className="rounded-lg bg-green-900 p-3 transition-all duration-300 group-hover:bg-green-500">
                        <Icon className="h-6 w-6 text-white/80" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
