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
import { CheckCircle2, Loader2 } from "lucide-react";

interface MedicationMonitoringDialog2Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface Answer {
  question: number;
  answer: string;
}

export function MedicationMonitoringDialog2({
  isOpen,
  onClose,
  onComplete,
}: MedicationMonitoringDialog2Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const questions = [
    "Dalam beberapa hari terakhir, apakah Anda masih lupa minum obat?",
    "Apakah Anda sudah berusaha minum obat sesuai jadwal setiap hari?",
    "Apakah Anda tetap minum obat walaupun merasa sudah sehat?",
    "Jika merasa tidak nyaman setelah minum obat, apakah Anda tetap berkonsultasi ke tenaga kesehatan?",
  ];

  const handleAnswer = (questionNum: number, answer: string) => {
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.question !== questionNum);
      return [...filtered, { question: questionNum, answer }];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (answers.length !== questions.length) {
      alert("Silakan jawab semua pertanyaan");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Monitoring Edukasi 2 data:", answers);

      setAnswers([]);
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Monitoring Kepatuhan Minum Obat - Edukasi 2</DialogTitle>
          <DialogDescription>
            Silakan jawab pertanyaan berikut sesuai kondisi Anda saat ini.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question, index) => {
            const questionNum = index + 1;
            const isAnswered = answers.some((a) => a.question === questionNum);

            return (
              <div key={questionNum} className="space-y-3 pb-4 border-b last:border-b-0">
                <p className="font-semibold text-sm">
                  {questionNum}. {question}
                </p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={
                      isAnswered && answers.find((a) => a.question === questionNum)?.answer === "Ya"
                        ? "default"
                        : "outline"
                    }
                    className="flex-1"
                    onClick={() => handleAnswer(questionNum, "Ya")}
                  >
                    👉 Ya
                  </Button>
                  <Button
                    type="button"
                    variant={
                      isAnswered && answers.find((a) => a.question === questionNum)?.answer === "Tidak"
                        ? "default"
                        : "outline"
                    }
                    className="flex-1"
                    onClick={() => handleAnswer(questionNum, "Tidak")}
                  >
                    👉 Tidak
                  </Button>
                </div>
              </div>
            );
          })}

          <div className="flex gap-3 pt-6">
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
              disabled={isSubmitting || answers.length !== questions.length}
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
