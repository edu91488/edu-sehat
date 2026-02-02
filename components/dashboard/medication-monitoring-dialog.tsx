"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2 } from "lucide-react";

interface MedicationMonitoringDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function MedicationMonitoringDialog({
  isOpen,
  onClose,
  onComplete,
}: MedicationMonitoringDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    medicationName: "",
    dosage: "",
    timeConsumed: "",
    timesPerDay: "",
    sideEffects: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.medicationName || !formData.dosage || !formData.timeConsumed || !formData.timesPerDay) {
      alert("Silakan isi semua field yang wajib");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Monitoring data saved:", formData);

      // Reset form
      setFormData({
        medicationName: "",
        dosage: "",
        timeConsumed: "",
        timesPerDay: "",
        sideEffects: "",
        notes: "",
      });

      // Call callback to mark as completed
      onComplete();
      onClose();
    } catch (error) {
      console.error("Error saving monitoring data:", error);
      alert("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Monitoring Kepatuhan Minum Obat</DialogTitle>
          <DialogDescription>
            Silakan isi data kepatuhan minum obat Anda hari ini
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Medication Name */}
          <div className="space-y-2">
            <Label htmlFor="medicationName" className="required">
              Nama Obat <span className="text-red-500">*</span>
            </Label>
            <Input
              id="medicationName"
              placeholder="Misal: Metformin, Lisinopril"
              value={formData.medicationName}
              onChange={(e) =>
                setFormData({ ...formData, medicationName: e.target.value })
              }
              required
            />
          </div>

          {/* Dosage */}
          <div className="space-y-2">
            <Label htmlFor="dosage">
              Dosis <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dosage"
              placeholder="Misal: 500 mg, 1 tablet"
              value={formData.dosage}
              onChange={(e) =>
                setFormData({ ...formData, dosage: e.target.value })
              }
              required
            />
          </div>

          {/* Time Consumed */}
          <div className="space-y-2">
            <Label htmlFor="timeConsumed">
              Waktu Minum Terakhir <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.timeConsumed}
              onValueChange={(value) =>
                setFormData({ ...formData, timeConsumed: value })
              }
            >
              <SelectTrigger id="timeConsumed">
                <SelectValue placeholder="Pilih waktu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Pagi (06:00 - 10:00)</SelectItem>
                <SelectItem value="afternoon">Siang (10:00 - 14:00)</SelectItem>
                <SelectItem value="evening">Malam (14:00 - 18:00)</SelectItem>
                <SelectItem value="night">Malam Hari (18:00 - 22:00)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Times Per Day */}
          <div className="space-y-2">
            <Label htmlFor="timesPerDay">
              Sudah Diminum Berapa Kali Hari Ini <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.timesPerDay}
              onValueChange={(value) =>
                setFormData({ ...formData, timesPerDay: value })
              }
            >
              <SelectTrigger id="timesPerDay">
                <SelectValue placeholder="Pilih jumlah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 kali</SelectItem>
                <SelectItem value="2">2 kali</SelectItem>
                <SelectItem value="3">3 kali</SelectItem>
                <SelectItem value="4">4 kali atau lebih</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Side Effects */}
          <div className="space-y-2">
            <Label htmlFor="sideEffects">
              Ada Efek Samping?
            </Label>
            <Select
              value={formData.sideEffects}
              onValueChange={(value) =>
                setFormData({ ...formData, sideEffects: value })
              }
            >
              <SelectTrigger id="sideEffects">
                <SelectValue placeholder="Pilih" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak ada</SelectItem>
                <SelectItem value="mild">Ringan</SelectItem>
                <SelectItem value="moderate">Sedang</SelectItem>
                <SelectItem value="severe">Berat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Catatan Tambahan (Opsional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Tuliskan catatan atau keluhan apapun..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Simpan & Selesai
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
