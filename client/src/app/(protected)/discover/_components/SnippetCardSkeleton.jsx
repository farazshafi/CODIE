import SpotlightCard from "@/components/ui/SpotlightCard/SpotlightCard";
import { Clock } from "lucide-react";

const SnippetCardSkeleton = () => {
  return (
    <div className="rounded-lg p-5 animate-pulse">
      <SpotlightCard spotlightColor="rgba(77, 79, 79, 0.3)">
        <div className="flex flex-row items-center justify-between">
          <div className="flex">
            <div
              className="rounded-lg bg-gray-700"
              style={{ height: "60px", width: "60px" }}
            ></div>

            <div className="flex flex-col justify-between ml-3">
              <div className="bg-gray-700 text-transparent py-1 px-2 w-fit rounded-sm">
                <p className="text-xs">Loading...</p>
              </div>

              <div className="flex text-xs flex-row items-center gap-x-1 mt-1 text-gray-400">
                <Clock size={10} />
                <div className="h-3 w-16 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>

          <div className="gap-x-4 flex flex-row items-center">
            <div className="h-10 w-10 bg-gray-700 rounded-md"></div>
            <div className="h-10 w-10 bg-gray-700 rounded-md"></div>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="h-5 w-1/2 bg-gray-700 rounded"></div>

          <div className="flex items-center gap-x-3 bg-gray-700 p-2 rounded-sm w-fit">
            <div className="h-6 w-6 bg-gray-600 rounded-full"></div>
            <div className="h-3 w-20 bg-gray-600 rounded"></div>
          </div>
        </div>

        <div className="mt-5">
          <div className="h-[155px] w-[235px] bg-gray-700 rounded-md"></div>
        </div>
      </SpotlightCard>
    </div>
  );
};

export default SnippetCardSkeleton;
