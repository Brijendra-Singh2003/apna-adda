import React, { useMemo, useState } from "react";
import { getWorlds } from "@/api/worlds";
import WorldCard, { WorldSCardkeleton } from "@/components/world/WorldCard";
import { BACKEND_URL } from "@/lib/constants";
import { Link } from "react-router-dom";
import userContext from "@/context/User";
import { useQuery } from "@tanstack/react-query";
import {
  LogInIcon,
  LucideRefreshCcw,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import NewWorldFormDialog from "./NewWorldFormDialog";

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const session = React.useContext(userContext);

  const {
    data: worlds = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryFn: getWorlds,
    queryKey: [session.user?._id, "worlds"],
    enabled: !!session.user?._id,
  });

  const filteredWorlds = useMemo(() => {
    if (!searchTerm) return worlds;
    const keys = searchTerm.toLowerCase().split(" ");

    return worlds.filter((world) => {
      const worldName = world.name.toLowerCase();
      return keys.every((key) => worldName.includes(key));
    });
  }, [worlds, searchTerm]);

  if (!session.isLoading && !session.user?._id) {
    return (
      <div className="container mx-auto h-full min-h-96 flex items-center justify-center">
        <div className="h-96 max-h-screen flex flex-col gap-4 items-center justify-center text-muted-foreground">
          <h3 className="text-lg">You are logged out, please log in.</h3>
          <Link
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-full cursor-pointer"
            to={`${BACKEND_URL}/auth/google`}
          >
            <LogInIcon className="size-5" /> Login
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || session.isLoading) {
    return (
      <div className="p-4 container max-w-7xl mx-auto">
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {WorldSCardkeleton}
          {WorldSCardkeleton}
          {WorldSCardkeleton}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto h-full min-h-96 flex items-center justify-center">
        <div className="flex flex-col gap-4 items-center text-muted-foreground">
          <h3 className="text-lg">
            Unable to load worlds. Please try again later.
          </h3>
          <button
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full cursor-pointer"
            onClick={() => refetch()}
          >
            <LucideRefreshCcw className="size-4" /> Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 container max-w-7xl mx-auto">
      <div className="px-4 flex gap-4 items-center justify-between">
        <div className="w-full max-w-md flex border rounded-full overflow-hidden">
          <input
            className="w-full py-1.5 px-4 bg-transparent rounded-l-full focus:ring-1"
            placeholder="Search"
            name="q"
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button className="w-1/6 min-w-fit px-3 bg-primary text-primary-foreground flex items-center justify-center">
            <SearchIcon className="size-5" />
          </button>
        </div>

        <NewWorldFormDialog>
          <button className="px-4 py-2 flex items-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full cursor-pointer">
            <PlusIcon className="size-5" />{" "}
            <span className="hidden sm:inline">New World</span>
          </button>
        </NewWorldFormDialog>
      </div>
      {filteredWorlds?.length! <= 0 ? (
        <div className="h-96 max-h-screen flex flex-col gap-4 items-center justify-center text-muted-foreground">
          <h3 className="text-lg">No worlds found</h3>
          <NewWorldFormDialog>
            <button className="text-lg flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-full cursor-pointer">
              Create a World
            </button>
          </NewWorldFormDialog>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredWorlds?.map((world) => (
            <WorldCard key={world._id} world={world} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
