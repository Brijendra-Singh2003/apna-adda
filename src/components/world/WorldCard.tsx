import { Link } from "react-router-dom";
import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Ellipsis, Trash2Icon } from "lucide-react";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { getWorlds, removeWorld } from "@/api/worlds";
import userContext from "@/context/User";

interface Props {
  world: World;
}

function WorldCard({ world }: Props) {
  const session = React.useContext(userContext);
  const {
    // data: worlds,
    // isLoading,
    // error,
    refetch,
  } = useQuery({
    queryFn: getWorlds,
    queryKey: [session.user?._id, "worlds"],
    enabled: !!session.user?.email,
    initialData: [],
  });
  const deleteWorldMutation = useMutation({
    mutationFn: removeWorld,
    onSuccess: () => {
      refetch(); // refresh list after creation
    },
  });
  return (
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
            <DropdownMenuItem
              className="focus:bg-destructive focus:text-destructive-foreground"
              onClick={async (e) => {
                e.stopPropagation();
              }}
            >
              <button
                className="flex"
                onClick={async (e) => {
                  e.stopPropagation();
                  const id = world._id as string;
                  console.log("id to be deleted ", id);
                  await deleteWorldMutation.mutateAsync(id);
                }}
              >
                {deleteWorldMutation.isPending ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2Icon /> Delete
                  </>
                )}
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="absolute w-full text-white bottom-0 p-4 pt-6 z-10 bg-gradient-to-t from-gray-900/75 to-gray-900/0">
        {world.name}
      </p>
    </Link>
  );
}

export default WorldCard;
