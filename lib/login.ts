import getSession from "@/lib/session";

export default async function login(id: number) {
    try {
        const session = await getSession();
        session.id = id;
        await session.save();
    } catch (error) {
        console.error("Login failed:", error);
    };
};