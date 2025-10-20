"use server";

import { prisma } from "../prisma";

export async function getAppointments() {
  try {
    const appoinments = await prisma.appointment.findMany({
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        doctor: {
          select: { name: true, imageUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return appoinments;
  } catch (error) {
    console.log("Error in getAppointments server action: ", error);
    return [];
  }
}
