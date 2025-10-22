
import { FolderGit2, GitCommit } from "lucide-react";
import { StatsCard } from "../(protected)/contributor/_components/StatusCard";
import { ContributionGraph } from "../(protected)/contributor/_components/ContributionGraph";
import { LatestProjects } from "../(protected)/contributor/_components/LatestProjects";
import { ContributorProfile } from "../(protected)/contributor/_components/ContributerProfile";


const Index = () => {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Contributor Profile
          </h1>
          <p className="text-muted">
            Track your contributions and project involvement
          </p>
        </div>

        {/* Profile Section */}
        <ContributorProfile
          name="Zaeem Shafi"
          email="zaeem@gmail.com"
          avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Zaeem"
        />

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Projects"
            value={15}
            icon={FolderGit2}
            trend={{ value: 12, positive: true }}
          />
          <StatsCard
            title="Total Contributions"
            value={342}
            icon={GitCommit}
            trend={{ value: 8, positive: true }}
          />
        </div>

        {/* Graph and Projects */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ContributionGraph />
          <LatestProjects />
        </div>
      </div>
    </div>
  );
};

export default Index;
