import React, { useContext, useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader2Icon } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { createWorld } from "@/api/worlds";
import { queryClient } from "@/App";
import userContext from "@/context/User";

type Props = {
  children: Readonly<React.ReactNode>;
};

function NewWorldFormDialog({ children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const session = useContext(userContext);

  const createWorldMutation = useMutation({
    mutationFn: createWorld,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [session.user?._id, "worlds"],
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New World</DialogTitle>
          <DialogDescription>
            Enter details about your new world.
          </DialogDescription>
        </DialogHeader>

        {/* Form Content */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = formData.get("name") as string;

            try {
              await createWorldMutation.mutateAsync({ name });
              setIsOpen(false);
              e.currentTarget?.reset();
            } catch (err) {
              console.error("Failed to create world", err);
            }
          }}
          className="flex flex-col gap-4"
        >
          <Input name="name" placeholder="World Name" required />

          <DialogFooter>
            <Button type="submit" disabled={createWorldMutation.isPending}>
              {createWorldMutation.isPending ? (
                <span className="w-12">
                  <Loader2Icon className="animate-spin mx-auto" />
                </span>
              ) : (
                <span className="w-12">Create</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default NewWorldFormDialog;
