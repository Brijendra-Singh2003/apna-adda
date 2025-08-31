import { Link } from "react-router-dom";
import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Loader2Icon, MoreVerticalIcon, Trash2Icon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { removeWorld } from "@/api/worlds";
import userContext from "@/context/User";
import { queryClient } from "@/App";
import { Button } from "../ui/button";

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
              <DropdownMenuItem className="p-0">
                <Button
                  className="w-full justify-start"
                  variant="destructive"
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
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Link>
  );
}

export const WorldSCardkeleton = (
  <div>
    <div className="bg-muted rounded-xl aspect-video"></div>
    <div className="mt-3 mx-1 bg-muted w-4/5 rounded-lg h-6"></div>
  </div>
);

export default WorldCard;
