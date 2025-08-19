import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Ellipsis, Trash2Icon } from "lucide-react";

interface Props {
  world: World;
}

function WorldCard({ world }: Props) {
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
  );
}

export default WorldCard;
