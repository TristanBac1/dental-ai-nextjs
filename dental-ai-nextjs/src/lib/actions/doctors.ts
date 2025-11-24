"use server";

import { Gender } from "@prisma/client";
import { prisma } from "../prisma";
import { generateAvatar } from "../utils";
import { revalidatePath } from "next/cache";

interface CreateDoctorInput {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  gender: Gender;
  isActive: boolean;
}

interface UpdateDoctorInput extends Partial<CreateDoctorInput> {
  id: string;
}

export async function getDoctors() {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return doctors.map((doctor) => ({
      ...doctor,
      appointmentsCount: doctor._count.appointments,
    }));
  } catch (error) {
    console.log("Error in getDoctors server action: ", error);
  }
}

export async function createDoctor(input: CreateDoctorInput) {
  try {
    if (!input.name || !input.email) {
      throw new Error("Name and Email are required");
    }

    const newDoctor = await prisma.doctor.create({
      data: {
        ...input,
        imageUrl: generateAvatar(input.name, input.gender),
      },
    });

    revalidatePath("/admin");

    return newDoctor;
  } catch (error: any) {
    console.log("Error in createDoctor server action: ", error);

    if (error?.code === "P2002") {
      throw new Error("A doctor with this email already exists.");
    }

    throw new Error("Failed to create doctor. Please try again.");
  }
}

export async function updateDoctor(input: UpdateDoctorInput) {
  try {
    if (!input.name || !input.email) {
      throw new Error("Name and Email are required");
    }

    const currentDoctor = await prisma.doctor.findUnique({
      where: { id: input.id },
      select: { email: true },
    });

    if (!currentDoctor) {
      throw new Error("Doctor not found");
    }

    if (input.email !== currentDoctor.email) {
      const emailExists = await prisma.doctor.findUnique({
        where: { email: input.email! },
      });

      if (emailExists) {
        throw new Error("A doctor with this email already exists.");
      }
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id: input.id },
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        specialty: input.specialty,
        gender: input.gender,
        isActive: input.isActive,
      },
    });

    revalidatePath("/admin");
    return updatedDoctor;
  } catch (error) {
    console.log("Error in updateDoctor server action: ", error);
    throw new Error("Failed to update doctor. Please try again.");
  }
}

export async function getAvailableDoctors() {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return doctors.map((doctor) => ({
      ...doctor,
      appointmentsCount: doctor._count.appointments,
    }));
  } catch (error) {
    console.log("Error in getAvailableDoctors server action: ", error);
    throw new Error("Failed to fetch available doctors. Please try again.");
  }
}
