import { getWorlds } from "@/api/worlds";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import userContext from "@/context/User";
import { useQuery } from "@tanstack/react-query";
import { Ellipsis, LucideRefreshCcw, Trash2Icon } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const { user } = React.useContext(userContext);
  const {
    data: worlds,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryFn: () => getWorlds(user?._id ?? ""),
    queryKey: [user?._id, "worlds"],
    initialData: [],
    enabled: !!user?.email,
  });

  if (error) {
    return (
      <div className="container mx-auto h-full min-h-96 flex items-center justify-center">
        <div className="flex flex-col gap-4 items-center">
          <h3>Unable to load worlds. Please try again later.</h3>
          <button
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md cursor-pointer"
            onClick={() => refetch()}
          >
            Reload <LucideRefreshCcw className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 container mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-medium">My Worlds</h1>
        <Button>Add new</Button>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <div className="bg-gray-200 rounded-xl shadowlg aspect-video"></div>
            <div className="bg-gray-200 rounded-xl shadowlg aspect-video"></div>
            <div className="bg-gray-200 rounded-xl shadowlg aspect-video"></div>
          </>
        ) : (
          worlds.map((world) => (
            <Link
              className="relative group rounded-xl overflow-hidden shadow-md aspect-video hover:shadow-lg transition"
              to="/play"
            >
              <img
                className="h-full w-full object-cover object-center"
                src="/thumb.png"
                alt=""
              />
              <div className="opacity-0 group-hover:opacity-100 transition-all absolute top-0 w-full flex items-center justify-end p-2 pb-4 bg-gradient-to-b from-gray-900/75 to-gray-900/0">
                <DropdownMenu>
                <DropdownMenuTrigger className="text-white">
                  <Ellipsis className="size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="focus:bg-destructive focus:text-destructive-foreground">
                      <Trash2Icon /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
              <p className="absolute w-full text-white bottom-0 p-4 pt-6 z-10 bg-gradient-to-t from-gray-900/75 to-gray-900/0">
                {world.name}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
