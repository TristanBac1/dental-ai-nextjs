import { useUpdateDoctor } from "@/hooks/use-doctors";
import { formatPhoneNumber } from "@/lib/utils";
import { Doctor, Gender } from "@prisma/client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface EditDoctorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

function EditDoctorDialog({ isOpen, onClose, doctor }: EditDoctorDialogProps) {
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(doctor);

  useEffect(() => {
    if (isOpen) setEditingDoctor(doctor);
  }, [doctor, isOpen]);

  const updateDoctorMutation = useUpdateDoctor();

  const handlePhoneChange = (value: string) => {
    const formattedValue = formatPhoneNumber(value);
    if (editingDoctor) {
      setEditingDoctor({ ...editingDoctor, phone: formattedValue });
    }
  };

  const handleClose = () => {
    onClose();
    setEditingDoctor(null);
  };

  const handleSave = () => {
    if (editingDoctor) {
      updateDoctorMutation.mutate(editingDoctor, {
        onSuccess: () => {
          handleClose();
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Edit Doctor</DialogTitle>
          <DialogDescription>
            Update doctor information and status.
          </DialogDescription>
        </DialogHeader>

        {editingDoctor && (
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Name</Label>
                <Input
                  id='name'
                  value={editingDoctor.name}
                  onChange={(e) =>
                    setEditingDoctor({ ...editingDoctor, name: e.target.value })
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='speciality'>Speciality</Label>
                <Input
                  id='speciality'
                  value={editingDoctor.specialty}
                  onChange={(e) =>
                    setEditingDoctor({
                      ...editingDoctor,
                      specialty: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={editingDoctor.email}
                onChange={(e) =>
                  setEditingDoctor({ ...editingDoctor, email: e.target.value })
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='phone'>Phone</Label>
              <Input
                id='phone'
                value={editingDoctor.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder='(555) 123-4567'
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='gender'>Gender</Label>
                <Select
                  value={editingDoctor.gender || ""}
                  onValueChange={(value) =>
                    setEditingDoctor({
                      ...editingDoctor,
                      gender: value as Gender,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select gender' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='MALE'>Male</SelectItem>
                    <SelectItem value='FEMALE'>Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='status'>Status</Label>
                <Select
                  value={editingDoctor.isActive ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setEditingDoctor({
                      ...editingDoctor,
                      isActive: value === "active",
                    })
                  }
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
        )}

        <DialogFooter>
          <Button variant='outline' onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className='bg-primary hover:bg-primary/90'
            disabled={updateDoctorMutation.isPending}
          >
            {updateDoctorMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditDoctorDialog;
