import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientPortal from "@/components/ClientPortal";

export default async function ClientPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { contact: { include: { org: { select: { id: true, name: true } } } } },
  });

  const org = user?.contact?.org ?? null;

  return <ClientPortal orgId={org?.id} orgName={org?.name} />;
}
