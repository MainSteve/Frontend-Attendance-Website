import React, { useState, useEffect } from 'react';
import { useUsers, useWorkingHours, useWorkingHoursManager } from '@/hooks/workingHours';
import { LocalScheduleState, DayOfWeek, SchedulePayload } from '@/types/WorkingHours';
import { AlertCircle, CheckCircle, Loader2, Save, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const WorkSchedules = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [schedule, setSchedule] = useState<LocalScheduleState>({
    monday: { start: '09:00', end: '17:00' },
    tuesday: { start: '09:00', end: '17:00' },
    wednesday: { start: '09:00', end: '17:00' },
    thursday: { start: '09:00', end: '17:00' },
    friday: { start: '09:00', end: '17:00' },
    saturday: { start: '', end: '' },
    sunday: { start: '', end: '' },
  });

  const [successMessage, setSuccessMessage] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);

  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = {
    monday: 'Senin',
    tuesday: 'Selasa',
    wednesday: 'Rabu',
    thursday: 'Kamis',
    friday: 'Jumat',
    saturday: 'Sabtu',
    sunday: 'Minggu'
  };

  // Hooks
  const { users, isLoading: usersLoading, isError: usersError } = useUsers();
  const { 
    workingHoursData, 
    isLoading: scheduleLoading, 
    isError: scheduleError,
    mutate: mutateSchedule 
  } = useWorkingHours(selectedEmployee ? parseInt(selectedEmployee) : undefined);
  
  const { 
    updateUserWorkingHours, 
    isLoading: saveLoading, 
    error: saveError, 
    clearError 
  } = useWorkingHoursManager();

  // Load existing schedule when employee is selected
  useEffect(() => {
    if (workingHoursData?.schedule) {
      const newSchedule: LocalScheduleState = {
        monday: { start: '', end: '' },
        tuesday: { start: '', end: '' },
        wednesday: { start: '', end: '' },
        thursday: { start: '', end: '' },
        friday: { start: '', end: '' },
        saturday: { start: '', end: '' },
        sunday: { start: '', end: '' },
      };

      days.forEach(day => {
        const daySchedule = workingHoursData.schedule[day];
        if (daySchedule) {
          newSchedule[day] = {
            start: daySchedule.start_time,
            end: daySchedule.end_time
          };
        }
      });

      setSchedule(newSchedule);
      setHasChanges(false);
    } else if (selectedEmployee && !scheduleLoading) {
      // Reset to default if no existing schedule
      setSchedule({
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
        saturday: { start: '', end: '' },
        sunday: { start: '', end: '' },
      });
      setHasChanges(false);
    }
  }, [workingHoursData, selectedEmployee, scheduleLoading]);

  // Clear messages when employee changes
  useEffect(() => {
    setSuccessMessage('');
    clearError();
  }, [selectedEmployee, clearError]);

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    setHasChanges(false);
  };

  const handleScheduleChange = (day: DayOfWeek, field: 'start' | 'end', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
    setHasChanges(true);
    setSuccessMessage('');
    clearError();
  };

  const handleDayOffToggle = (day: DayOfWeek, isOff: boolean) => {
    if (isOff) {
      setSchedule(prev => ({
        ...prev,
        [day]: { start: '', end: '' }
      }));
    } else {
      setSchedule(prev => ({
        ...prev,
        [day]: { start: '09:00', end: '17:00' }
      }));
    }
    setHasChanges(true);
    setSuccessMessage('');
    clearError();
  };

  const validateSchedule = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    days.forEach(day => {
      const daySchedule = schedule[day];
      const dayName = dayNames[day];

      if (daySchedule.start && daySchedule.end) {
        if (daySchedule.start >= daySchedule.end) {
          errors.push(`${dayName}: Jam mulai harus lebih awal dari jam selesai`);
        }
      } else if ((daySchedule.start && !daySchedule.end) || (!daySchedule.start && daySchedule.end)) {
        errors.push(`${dayName}: Jam mulai dan jam selesai harus diisi keduanya atau kosongkan keduanya`);
      }
    });

    return { isValid: errors.length === 0, errors };
  };

  const handleSave = async () => {
    if (!selectedEmployee) {
      return;
    }

    const validation = validateSchedule();
    if (!validation.isValid) {
      // You might want to show these errors in a toast or alert
      console.error('Validation errors:', validation.errors);
      return;
    }

    try {
      // Convert schedule to API format
      const schedules: SchedulePayload[] = [];
      
      days.forEach(day => {
        const daySchedule = schedule[day];
        if (daySchedule.start && daySchedule.end) {
          schedules.push({
            day_of_week: day,
            start_time: daySchedule.start,
            end_time: daySchedule.end
          });
        }
      });

      const payload = {
        schedules,
        replace_all: true // This will replace all existing schedules for the user
      };

      await updateUserWorkingHours(parseInt(selectedEmployee), payload);
      
      // Refresh the data
      await mutateSchedule();
      
      setSuccessMessage('Jadwal kerja berhasil disimpan!');
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save schedule:', error);
    }
  };

  const handleReset = () => {
    if (workingHoursData?.schedule) {
      // Reset to original data
      const newSchedule: LocalScheduleState = {
        monday: { start: '', end: '' },
        tuesday: { start: '', end: '' },
        wednesday: { start: '', end: '' },
        thursday: { start: '', end: '' },
        friday: { start: '', end: '' },
        saturday: { start: '', end: '' },
        sunday: { start: '', end: '' },
      };

      days.forEach(day => {
        const daySchedule = workingHoursData.schedule[day];
        if (daySchedule) {
          newSchedule[day] = {
            start: daySchedule.start_time,
            end: daySchedule.end_time
          };
        }
      });

      setSchedule(newSchedule);
    } else {
      // Reset to default schedule
      setSchedule({
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
        saturday: { start: '', end: '' },
        sunday: { start: '', end: '' },
      });
    }
    setHasChanges(false);
    setSuccessMessage('');
    clearError();
  };

  const isLoading = usersLoading || scheduleLoading || saveLoading;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Jadwal Kerja</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        {/* Employee Selection */}
        <div className="mb-6">
          <label htmlFor="employee-select" className="block text-sm font-medium text-gray-700 mb-2">Pilih Karyawan</label>
          <select
            value={selectedEmployee}
            onChange={(e) => handleEmployeeChange(e.target.value)}
            disabled={usersLoading}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {usersLoading ? 'Memuat karyawan...' : 'Pilih karyawan...'}
            </option>
            {users.map((user) => (
              <option key={user.id} value={user.id.toString()}>
                {user.name}
              </option>
            ))}
          </select>
          {usersError && (
            <p className="mt-1 text-sm text-red-600">Gagal memuat data karyawan</p>
          )}
        </div>

        {/* Loading State */}
        {scheduleLoading && selectedEmployee && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Memuat jadwal kerja...</span>
          </div>
        )}

        {/* Error State */}
        {scheduleError && selectedEmployee && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Gagal memuat jadwal kerja. Silakan coba lagi.
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Save Error */}
        {saveError && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {saveError}
            </AlertDescription>
          </Alert>
        )}

        {/* Schedule Form */}
        {selectedEmployee && !scheduleLoading && (
          <>
            <div className="space-y-4">
              {days.map((day) => {
                const isOff = !schedule[day].start && !schedule[day].end;
                return (
                  <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-32">
                      <p className="font-medium text-gray-700">{dayNames[day]}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={schedule[day].start}
                        onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                        disabled={isOff || isLoading}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="time"
                        value={schedule[day].end}
                        onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                        disabled={isOff || isLoading}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isOff}
                        onChange={(e) => handleDayOffToggle(day, e.target.checked)}
                        disabled={isLoading}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm text-gray-600">Libur</span>
                    </label>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={!hasChanges || isLoading}
                className="flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {saveLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Simpan Jadwal
              </button>
              
              <button
                onClick={handleReset}
                disabled={!hasChanges || isLoading}
                className="flex items-center gap-2 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </>
        )}

        {/* No Employee Selected */}
        {!selectedEmployee && (
          <div className="text-center py-8">
            <p className="text-gray-500">Pilih karyawan untuk melihat dan mengedit jadwal kerja</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkSchedules;