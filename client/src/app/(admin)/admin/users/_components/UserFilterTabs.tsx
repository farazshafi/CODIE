
type FilterTab = 'All Users' | 'Suspended' | 'pro users';

interface UserFilterTabsProps {
    activeTab: FilterTab;
    setActiveTab: (tab: FilterTab) => void;
    users: Array<{ status: string; plan: string; }>;
}

const UserFilterTabs: React.FC<UserFilterTabsProps> = ({ activeTab, setActiveTab, users }) => {
    return (
        <div className="admin-tabs flex flex-wrap border-b border-gray-700 mb-4 overflow-x-auto">
            {(['All Users', 'Suspended', 'pro users'] as FilterTab[]).map((tab) => (
                <button
                    key={tab}
                    className={`px-4 py-2 whitespace-nowrap ${activeTab === tab ? 'text-green-500 border-b-green-500' : ''}`}
                    onClick={() => setActiveTab(tab)}
                >
                    {tab}
                    <span className="ml-1 text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                        {tab === 'All Users'
                            ? users.length
                            : tab === 'Suspended'
                                ? users.filter(user => user.status === 'Suspended').length
                                : users.filter(user => user.plan.toLowerCase() === 'pro').length}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default UserFilterTabs;
