import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, User } from "lucide-react";

interface ContributorProfileProps {
    name: string;
    email: string;
    avatar?: string;
}

export const ContributorProfile = ({ name, email, avatar }: ContributorProfileProps) => {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    return (
        <Card className="overflow-hidden bg-tertiary transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <CardContent className="p-6">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-xl">
                        <AvatarImage src={avatar} alt={name} />
                        <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3 text-center sm:text-left">
                        <div>
                            <h2 className="text-3xl font-bold text-white">{name}</h2>
                            <div className="mt-2 flex items-center justify-center gap-2 text-muted-foreground sm:justify-start">
                                <Mail className="h-4 w-4" />
                                <span className="text-sm">{email}</span>
                            </div>
                        </div>

                        <Badge className="bg-black text-green-600 hover:bg-primary/20">
                            <User className="mr-1 h-3 w-3" />
                            Active Contributor
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
