"use client"
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useMutationHook } from "@/hooks/useMutationHook";
import { getContributedProjectsGraphData } from "@/apis/roomApi";


export const ContributionGraph = ({ id }: { id: string }) => {
    const [period, setPeriod] = useState<"month" | "year">("month");
    const [yearlyData, setYearlyData] = useState<{ name: string, contributions: number }[]>([])
    const [monthlyData, setMonthlyData] = useState<{ name: string, contributions: number }[]>([])
    const data = period === "month" ? monthlyData : yearlyData;

    const { mutate: getGraphData } = useMutationHook(getContributedProjectsGraphData, {
        onSuccess(response) {
            console.log(response.data)
            setYearlyData(response.data.yearlyData)
            setMonthlyData(response.data.monthlyData)
        }
    })

    useEffect(() => {
        getGraphData(id as string)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Card className="border-border bg-gray-500 text-white">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-xl font-bold text-white">
                    Contribution Overview
                </CardTitle>
                <Tabs value={period} onValueChange={(v) => setPeriod(v as "month" | "year")}>
                    <TabsList className="bg-secondary">
                        <TabsTrigger value="month" className="data-[state=active]:bg-primary data-[state=active]:text-green-600">
                            Monthly
                        </TabsTrigger>
                        <TabsTrigger value="year" className="data-[state=active]:bg-primary data-[state=active]:text-green-600">
                            Yearly
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="name"
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)",
                                color: "hsl(var(--foreground))",
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="contributions"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorContributions)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
