import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface TimePickerInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
}

export const TimePickerInput: React.FC<TimePickerInputProps> = ({
  value,
  onChange,
  label,
  required = false,
}) => {
  const [hours, setHours] = useState("12");
  const [minutes, setMinutes] = useState("00");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      setHours(h || "12");
      setMinutes(m || "00");
    }
  }, [value]);

  const handleApply = () => {
    onChange(`${hours}:${minutes}`);
    setOpen(false);
  };

  const hoursOptions = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  const minutesOptions = ["00", "15", "30", "45"];

  return (
    <div>
      <Label className="mb-2 block text-sm font-medium">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <Clock className="mr-2 h-4 w-4" />
            {value || "Seleccionar hora"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[120px] space-y-2">
                <Label>Hora</Label>
                <Select value={hours} onValueChange={setHours}>
                  <SelectTrigger>
                    <SelectValue placeholder="Hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {hoursOptions.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[120px] space-y-2">
                <Label>Minutos</Label>
                <Select value={minutes} onValueChange={setMinutes}>
                  <SelectTrigger>
                    <SelectValue placeholder="Minutos" />
                  </SelectTrigger>
                  <SelectContent>
                    {minutesOptions.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleApply} className="w-full">
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
