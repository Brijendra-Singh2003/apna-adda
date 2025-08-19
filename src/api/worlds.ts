import { api } from "@/lib/constants";

export async function getWorlds(): Promise<World[]> {
    const response = await api.get("/world");
    return response.data;
}

export async function createWorld(newWorld: { name: string }) {
    const response = await api.post("/world", newWorld);
    console.log(response.data);
}

export async function removeWorld(worldId: string) {
    const response = await api.delete("/world/" + worldId);
    console.log(response);
}
