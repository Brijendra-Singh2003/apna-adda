export async function getWorlds(user_id: string): Promise<World[]> {
    console.log("getting user world of", user_id);

    return [
        {
            _id: "park",
            name: "Hello World!",
            created_st: new Date().toDateString(),
        },
    ];
}