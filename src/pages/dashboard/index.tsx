import { getWorlds, createWorld } from "@/api/worlds";
import WorldCard from "@/components/world/worldCard";
import userContext from "@/context/User";
import { BACKEND_URL } from "@/lib/constants";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Loader2Icon,
  LogInIcon,
  LucideRefreshCcw,
  PlusIcon,
} from "lucide-react";
import React from "react";
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
import { Link } from "react-router-dom";
function Dashboard() {
  const session = React.useContext(userContext);

  const {
    data: worlds,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryFn: getWorlds,
    queryKey: [session.user?._id, "worlds"],
    enabled: !!session.user?.email,
    initialData: [],
  });

  const createWorldMutation = useMutation({
    mutationFn: createWorld,
    onSuccess: () => {
      refetch(); // refresh list after creation
    },
  });
  if (isLoading || session.isLoading) {
    return (
      <div className="p-4 container mx-auto">
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-400/20 rounded-xl shadowlg aspect-video"></div>
          <div className="bg-gray-400/20 rounded-xl shadowlg aspect-video"></div>
          <div className="bg-gray-400/20 rounded-xl shadowlg aspect-video"></div>
        </div>
      </div>
    );
  }

  if (!session.user) {
    return (
      <div className="container mx-auto h-full min-h-96 flex items-center justify-center">
        <div className="h-96 max-h-screen flex flex-col gap-8 items-center justify-center">
          <h3 className="text-3xl">You are logged out, please log in.</h3>
          <Link
            className="text-lg flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-full cursor-pointer"
            to={`${BACKEND_URL}/auth/google`}
          >
            Login <LogInIcon />
          </Link>
        </div>
      </div>
    );
  }

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
    <div className="p-4 container max-w-7xl mx-auto">
      {worlds.length <= 0 ? (
        <div className="h-96 max-h-screen flex flex-col gap-8 items-center justify-center">
          <h3 className="text-3xl">You do not have any worlds yet</h3>
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-lg flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-full cursor-pointer">
                Create a World <PlusIcon />
              </button>
            </DialogTrigger>
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
                    e.currentTarget.reset(); // clear form
                    document.getElementById("close-dialog")?.click(); // close dialog programmatically
                  } catch (err) {
                    console.error("Failed to create world", err);
                  }
                  // call mutation here (POST to backend)
                }}
                className="flex flex-col gap-4"
              >
                <Input name="name" placeholder="World Name" required />

                <DialogFooter>
                  <Button type="submit">
                    {" "}
                    {createWorldMutation.isPending ? (
                      <>
                        <Loader2Icon className="animate-spin"></Loader2Icon>
                        creating...
                      </>
                    ) : (
                      <>Create</>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {worlds.map((world) => (
            <WorldCard key={world._id} world={world} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
