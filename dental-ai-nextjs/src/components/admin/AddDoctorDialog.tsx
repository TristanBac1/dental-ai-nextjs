import { useCreateDoctor } from "@/hooks/use-doctors";
import { Gender } from "@prisma/client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { formatPhoneNumber } from "@/lib/utils";

interface AddDoctorDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddDoctorDialog = ({ isOpen, onClose }: AddDoctorDialogProps) => {
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    gender: "MALE" as Gender,
    isActive: true,
  });

  const createDoctorMutation = useCreateDoctor();

  const handlePhoneChange = (value: string) => {
    const formattedValue = formatPhoneNumber(value);
    setNewDoctor({ ...newDoctor, phone: formattedValue });
  };

  const handleSave = () => {
    createDoctorMutation.mutate(newDoctor, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  const handleClose = () => {
    onClose();
    setNewDoctor({
      name: "",
      email: "",
      phone: "",
      specialty: "",
      gender: "MALE",
      isActive: true,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Add New Doctor</DialogTitle>
          <DialogDescription>Add a new doctor to the system.</DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='new-name'>Name *</Label>
              <Input
                id='new-name'
                value={newDoctor.name}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, name: e.target.value })
                }
                placeholder='Dr. John Smith'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='new-specialty'>Speciality *</Label>
              <Input
                id='new-specialty'
                value={newDoctor.specialty}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, specialty: e.target.value })
                }
                placeholder='General Dentistry'
              />
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='new-email'>Email *</Label>
            <Input
              id='new-email'
              value={newDoctor.email}
              onChange={(e) =>
                setNewDoctor({ ...newDoctor, email: e.target.value })
              }
              placeholder='doctor@example.com'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='new-phone'>Phone</Label>
            <Input
              id='new-phone'
              value={newDoctor.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder='(123) 456-7890'
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='new-gender'>Gender</Label>
              <Select
                value={newDoctor.gender || ""}
                onValueChange={(value) => {
                  setNewDoctor({ ...newDoctor, gender: value as Gender });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select Gender' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='MALE'>Male</SelectItem>
                  <SelectItem value='FEMALE'>Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='new-status'>Status</Label>
              <Select
                value={newDoctor.isActive ? "active" : "inactive"}
                onValueChange={(value) => {
                  setNewDoctor({ ...newDoctor, isActive: value === "active" });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='inactive'>Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className='bg-primary hover:bg-primary/90'
            disabled={
              !newDoctor.name ||
              !newDoctor.email ||
              createDoctorMutation.isPending
            }
          >
            {createDoctorMutation.isPending ? "Saving..." : "Add Doctor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddDoctorDialog;
