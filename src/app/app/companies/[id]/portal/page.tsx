import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ClientPortal from "@/components/ClientPortal";

export default async function CompanyPortalPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const { id } = await params;
  const org = await prisma.org.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!org) notFound();

  return (
    <div style={{ minHeight: "100vh", background: "var(--warm-white)" }}>
      <div style={{ padding: "0.75rem 2rem", borderBottom: "1px solid var(--rule)", background: "var(--warm)", display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link href={`/app/companies/${id}`} style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#888", textDecoration: "none" }}>
          ← Back to {org.name}
        </Link>
      </div>
      <ClientPortal orgId={org.id} orgName={org.name} isPreview={true} />
    </div>
  );
}
