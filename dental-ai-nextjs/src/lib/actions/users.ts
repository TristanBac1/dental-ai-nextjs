"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

export async function syncUser() {
  try {
    const patient = await currentUser();
    if (!patient) return;
    const existingPatient = await prisma.patient.findUnique({
      where: {
        clerkId: patient.id,
      },
    });
    if (existingPatient) return existingPatient;

    const dbUser = await prisma.patient.create({
      data: {
        clerkId: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.emailAddresses[0]?.emailAddress,
        phone: patient.phoneNumbers[0]?.phoneNumber || null,
      },
    });

    return dbUser;
  } catch (error) {
    console.log("Error in syncUser server action: ", error);
  }
}
