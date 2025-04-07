import { Users } from "lucide-react";

const SidebarSkeleton = () => {
  // Create 8 skeleton items
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside
      className="h-full w-full md:w-80 border-r border-base-300 flex flex-col transition-all duration-200"
    >
      {/* Header */}
      <div className="border-b border-base-300 w-full p-4">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium block">Contacts</span>
          </div>
          <div className="skeleton btn btn-sm rounded w-32"></div>
        </div>

        <div className="skeleton tabs tabs-boxed mt-3 h-9 bg-base-300"></div>
        
        {/* Search Bar Skeleton */}
        <div className="mt-3 flex flex-col items-start gap-4">
          <div className="skeleton h-10 w-full rounded-full" />

          {/* Show Online Skeleton */}
          <div className="flex items-center gap-2">
            <div className="skeleton h-4 w-4 rounded" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-10" />
          </div>
        </div>
      </div>

      {/* Skeleton Contacts */}
      <div className="overflow-y-auto w-full py-3">
        {skeletonContacts.map((_, idx) => (
          <div key={idx} className="w-full p-3 flex items-center gap-3">
            {/* Avatar skeleton */}
            <div className="relative mx-0">
              <div className="skeleton size-12 rounded-full" />
            </div>

            {/* User info skeleton*/}
            <div className="block text-left min-w-0 flex-1">
              <div className="skeleton h-4 w-32 mb-2" />
              <div className="skeleton h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
