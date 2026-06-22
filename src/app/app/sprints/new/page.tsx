import { prisma } from "@/lib/prisma";
import NewSprintForm from "./NewSprintForm";

export default async function NewSprintPage() {
  const last = await prisma.sprint.findFirst({ orderBy: { number: "desc" } });
  const nextNumber = (last?.number ?? 0) + 1;

  return <NewSprintForm nextNumber={nextNumber} />;
}
