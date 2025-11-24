"use client";
import Navbar from "@/components/Navbar";
import React, { useState } from "react";
import ProgressSteps from "@/components/appointments/ProgressSteps";
import DoctorSelectionStep from "@/components/appointments/DoctorSelectionStep";
import TimeSelectionStep from "@/components/appointments/TimeSelectionStep";
import {
  useBookAppointment,
  useUserAppointments,
} from "@/hooks/use-appointments";
import BookingConfirmationStep from "@/components/appointments/BookingConfirmationStep";
import { toast } from "sonner";
import { APPOINTMENT_TYPES } from "@/lib/utils";
import { format } from "date-fns/format";

const AppointmentsPage = () => {
  // state management for the booking process - this could be done with something like Zustand for larger apps
  const [selectedDentistId, setSelectedDentistId] = useState<string | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [currentStep, setCurrentStep] = useState(1); // 1: select dentist, 2: select time, 3: confirm
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);

  const bookAppointmentMutation = useBookAppointment();

  const { data: userAppointments = [] } = useUserAppointments();

  const handleSelectDentist = (dentistId: string) => {
    setSelectedDentistId(dentistId);

    setSelectedDate("");
    setSelectedTime("");
    setSelectedType("");
  };

  const handleBookAppointment = async () => {
    if (!selectedDentistId || !selectedDate || !selectedTime || !selectedType) {
      toast.error("Please complete all selections before booking.");
      return;
    }

    const appointmentType = APPOINTMENT_TYPES.find(
      (t) => t.id === selectedType
    );

    bookAppointmentMutation.mutate(
      {
        doctorId: selectedDentistId,
        date: selectedDate,
        time: selectedTime,
        reason: appointmentType?.name,
      },
      {
        onSuccess: async (appointment) => {
          setBookedAppointment(appointment);

          setShowConfirmationModal(true);
          toast.success("Appointment booked successfully!");

          setSelectedDentistId(null);
          setSelectedDate("");
          setSelectedTime("");
          setSelectedType("");
          setCurrentStep(1);
        },
        onError: (error) => {
          console.error("Booking error:", error);
          toast.error("Failed to book appointment. Please try again.");
        },
      }
    );
  };

  return (
    <>
      <Navbar />
      <div className='max-w-7xl mx-auto px-6 py-8 pt-24'>
        {/* header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>Book an Appointment</h1>
          <p className='text-muted-foreground'>
            Find and book with verified dentists in your area
          </p>
        </div>
        <ProgressSteps currentStep={currentStep} />
        {currentStep === 1 && (
          <DoctorSelectionStep
            selectedDentistId={selectedDentistId}
            onContinue={() => setCurrentStep(2)}
            onSelectDentist={handleSelectDentist}
          />
        )}

        {currentStep === 2 && selectedDentistId && (
          <TimeSelectionStep
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            selectedDentistId={selectedDentistId}
            selectedType={selectedType}
            onBack={() => setCurrentStep(1)}
            onContinue={() => setCurrentStep(3)}
            onDateChange={setSelectedDate}
            onTimeChange={setSelectedTime}
            onTypeChange={setSelectedType}
          />
        )}

        {currentStep === 3 && selectedDentistId && (
          <BookingConfirmationStep
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            selectedDentistId={selectedDentistId}
            selectedType={selectedType}
            isBooking={bookAppointmentMutation.isPending}
            onBack={() => setCurrentStep(2)}
            onModify={() => setCurrentStep(2)}
            onConfirm={handleBookAppointment}
          />
        )}
      </div>
      {/* SHOW EXISTING APPOINTMENTS FOR CURRENT USER*/}
      {userAppointments.length > 0 && (
        <div className='mb-8 max-w-7xl mx-auto px-6 py-8'>
          <h2 className='text-xl font-semibold mb-4'>
            Your Upcoming Appointments
          </h2>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {userAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className='bg-card border rounded-lg p-4 shadow-sm'
              >
                <div className='flex items-center gap-3 mb-3'>
                  <div className='size-10 bg-primary/10 rounded-full flex items-center justify-center'>
                    <img
                      src={appointment.doctorImageUrl}
                      alt={appointment.doctorName}
                      className='size-10 rounded-full'
                    />
                  </div>
                  <div>
                    <p className='font-medium text-sm'>
                      {appointment.doctorName}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {appointment.reason}
                    </p>
                  </div>
                </div>
                <div className='space-y-1 text-sm'>
                  <p className='text-muted-foreground'>
                    📅 {format(new Date(appointment.date), "MMM d, yyyy")}
                  </p>
                  <p className='text-muted-foreground'>🕐 {appointment.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentsPage;
