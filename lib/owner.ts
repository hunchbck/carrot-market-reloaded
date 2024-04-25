import getSession from "@/lib/session";

export default async function getIsOwner(userId: number) {
    const session = await getSession();
    if (session.id) {
      return session.id === userId;
    }
    return false;
};
