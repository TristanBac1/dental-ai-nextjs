"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

function transformAppointment(appointment: any) {
  return {
    ...appointment,
    patientName: `${appointment.patient.firstName || ""} ${
      appointment.patient.lastName || ""
    }`.trim(),
    patientEmail: appointment.patient.email,
    doctorName: appointment.doctor.name,
    doctorImageUrl: appointment.doctor.imageUrl || "",
    date: appointment.date.toISOString().split("T")[0],
  };
}

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

export async function getUserAppointments() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("You must be authenticated");

    const patient = await prisma.patient.findUnique({
      where: { clerkId: userId },
    });

    if (!patient) throw new Error("Patient not found");

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
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

    return appointments.map(transformAppointment);
  } catch (error) {
    console.log("Error in getUserAppointments server action: ", error);
    return [];
  }
}

export async function getUserAppointmentStats() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("You must be authenticated");

    const patient = await prisma.patient.findUnique({
      where: { clerkId: userId },
    });

    if (!patient) throw new Error("Patient not found");

    const [totalCount, completedCount] = await Promise.all([
      prisma.appointment.count({ where: { patientId: patient.id } }),
      prisma.appointment.count({
        where: { patientId: patient.id, status: "COMPLETED" },
      }),
    ]);

    return {
      totalAppointments: totalCount,
      completedAppointments: completedCount,
    };
  } catch (error) {
    console.log("Error in getUserAppointmentStats server action: ", error);
    return { totalAppointments: 0, completedAppointments: 0 };
  }
}

export async function getBookedTimeSlots(doctorId: string, date: string) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: new Date(date),
        status: {
          in: ["CONFIRMED", "COMPLETED"],
        },
      },
      select: { time: true },
    });
    return appointments.map((appt) => appt.time);
  } catch (error) {
    console.log("Error in getBookedTimeSlots server action: ", error);
    return [];
  }
}

interface BookAppointmentInput {
  doctorId: string;
  date: string;
  time: string;
  reason?: string;
}

export async function bookAppointment(input: BookAppointmentInput) {
  try {
    const { userId } = await auth();
    if (!userId)
      throw new Error("You must be logged in to book an appointment");

    if (!input.doctorId || !input.date || !input.time) {
      throw new Error("Doctor, date, and time are required");
    }

    const user = await prisma.patient.findUnique({
      where: { clerkId: userId },
    });

    if (!user)
      throw new Error(
        "Patient not found. Please ensure your profile is properly set up."
      );

    const appointment = await prisma.appointment.create({
      data: {
        doctorId: input.doctorId,
        patientId: user.id,
        date: new Date(input.date),
        time: input.time,
        reason: input.reason || "General consultation",
        status: "CONFIRMED",
      },
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
    });
    return transformAppointment(appointment);
  } catch (error) {
    console.log("Error in bookAppointment server action: ", error);
    throw error;
  }
}
