// src/components/common/DateRangePicker.tsx

import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDateForInput, getDateRangeOptions, formatDate } from '@/utils/leaveUtils';

interface DateRange {
  start: string;
  end: string;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (dateRange: DateRange | null) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date range",
  disabled = false,
  minDate,
  maxDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState(value?.start || '');
  const [tempEnd, setTempEnd] = useState(value?.end || '');

  const presetOptions = getDateRangeOptions();

  const handlePresetSelect = (preset: string) => {
    const option = presetOptions.find(opt => opt.label === preset);
    if (option) {
      const start = formatDateForInput(option.start);
      const end = formatDateForInput(option.end);
      setTempStart(start);
      setTempEnd(end);
      onChange({ start, end });
      setIsOpen(false);
    }
  };

  const handleCustomApply = () => {
    if (tempStart && tempEnd) {
      onChange({ start: tempStart, end: tempEnd });
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setTempStart('');
    setTempEnd('');
    onChange(null);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (!value || !value.start || !value.end) {
      return placeholder;
    }
    
    const startDate = new Date(value.start);
    const endDate = new Date(value.end);
    
    // Check if it matches a preset
    const matchingPreset = presetOptions.find(option => {
      const presetStart = formatDateForInput(option.start);
      const presetEnd = formatDateForInput(option.end);
      return presetStart === value.start && presetEnd === value.end;
    });
    
    if (matchingPreset) {
      return matchingPreset.label;
    }
    
    return `${formatDate(startDate, { day: 'numeric', month: 'short' })} - ${formatDate(endDate, { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const isValidRange = tempStart && tempEnd && new Date(tempStart) <= new Date(tempEnd);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
          disabled={disabled}
        >
          <Calendar className="mr-2 h-4 w-4" />
          <span className={!value ? "text-muted-foreground" : ""}>
            {getDisplayText()}
          </span>
          {value && (
            <X
              className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          {/* Preset Options */}
          <div>
            <Label className="text-sm font-medium">Quick Select</Label>
            <Select onValueChange={handlePresetSelect}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose preset" />
              </SelectTrigger>
              <SelectContent>
                {presetOptions.map((option) => (
                  <SelectItem key={option.label} value={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Selection */}
          <div>
            <Label className="text-sm font-medium">Custom Range</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label htmlFor="start-date" className="text-xs text-gray-500">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  min={minDate}
                  max={tempEnd || maxDate}
                />
              </div>
              <div>
                <Label htmlFor="end-date" className="text-xs text-gray-500">
                  End Date
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  min={tempStart || minDate}
                  max={maxDate}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="flex-1"
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={handleCustomApply}
              disabled={!isValidRange}
              className="flex-1"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;