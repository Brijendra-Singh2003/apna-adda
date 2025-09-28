import { Link } from "react-router-dom";
import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  CopyIcon,
  Loader2Icon,
  MoreVerticalIcon,
  Trash2Icon,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { removeWorld } from "@/api/worlds";
import userContext from "@/context/User";
import { queryClient } from "@/lib/constants";

interface Props {
  world: World;
}

function WorldCard({ world }: Props) {
  const session = React.useContext(userContext);

  const deleteWorldMutation = useMutation({
    mutationFn: removeWorld,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [session.user?._id, "worlds"],
      });
    },
  });

  return (
    <Link
      className="bg-popover transition outline-none"
      to={`/play/${world._id}`}
    >
      <img
        className="aspect-video w-full object-cover rounded-xl"
        src="/thumb.png"
        alt=""
      />

      <div className="flex">
        <div className="px-2 py-1.5 flex-1">
          <h3 className="font-semibold capitalize">{world.name}</h3>

          <p className="text-sm text-muted-foreground">
            {new Date(world.createdAt).toDateString()}
          </p>
        </div>

        <div className="py-1">
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full p-1.5 hover:bg-accent">
              <MoreVerticalIcon className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem className="cursor-pointer ">
                <CopyIcon /> Copy link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-0 text-destructive focus:text-destructive-foreground focus:bg-destructive cursor-pointer">
                <button
                  className="px-2 py-1.5 w-full flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={deleteWorldMutation.isPending}
                  onClick={async (e) => {
                    e.stopPropagation();
                    await deleteWorldMutation.mutateAsync(world._id);
                  }}
                >
                  {deleteWorldMutation.isPending ? (
                    <>
                      <Loader2Icon className="animate-spin size-4" /> Delete
                    </>
                  ) : (
                    <>
                      <Trash2Icon className="size-4" /> Delete
                    </>
                  )}
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Link>
  );
}

function CopyButton() {}

export const WorldSCardkeleton = (
  <div>
    <div className="bg-muted rounded-xl aspect-video"></div>
    <div className="mt-3 mx-1 bg-muted w-4/5 rounded-lg h-6"></div>
  </div>
);

export default WorldCard;
