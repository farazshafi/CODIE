
interface monthlyData {
    name: string;
    users: number;
    projects: number;
    rooms: number;
    revenue: number;
}
interface yearlyData {
    name: string;
    users: number;
    projects: number;
    rooms: number;
    revenue: number;
}

export interface IGetDashboardOverview {
    monthlyData: monthlyData[],
    yearlyData: yearlyData[]
}