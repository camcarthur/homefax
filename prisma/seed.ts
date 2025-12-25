import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const code = "ABC123";

  const company = await prisma.company.create({
    data: { name: "TimberRestoration LLC", phone: "555-123-4567" },
  });

  const home = await prisma.home.create({
    data: {
      label: "Smith Log Home",
      address: "123 Mountain Rd (optional)",
      notes: "South wall gets extra sun; check yearly.",
    },
  });

  await prisma.tag.create({
    data: { code, status: "CLAIMED", homeId: home.id },
  });

  const event = await prisma.serviceEvent.create({
    data: {
      homeId: home.id,
      companyId: company.id,
      serviceType: "RESTAIN",
      performedOn: new Date("2021-06-15"),
      notes: "Cleaned, light media blast on weathered areas, 2 coats applied.",
    },
  });

  await prisma.materialUsage.create({
    data: {
      eventId: event.id,
      category: "STAIN",
      brand: "Sashco",
      productLine: "Transformation",
      colorName: "Warm Honey",
      colorCode: "TH-217",
      batchLot: "LOT-99123",
    },
  });

  console.log("Seeded. Visit: http://localhost:3000/t/ABC123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
