import useSWR from 'swr';
import axios from '@/lib/axios';
import { 
  WorkingHoursResponse,
  HolidaysResponse,
  WeeklyScheduleDay,
  DayOfWeek,
  WorkingHourSchedule,
  Holiday
} from '@/types/WorkingHours';
import { useAuth } from '@/hooks/auth';

// Hook for fetching user's working hours
export const useWorkingHours = (userId?: number) => {
  const { user } = useAuth({});
  const targetUserId = userId || user?.id;

  const { data, error, mutate, isLoading } = useSWR<WorkingHoursResponse>(
    targetUserId ? `/api/working-hours/user/${targetUserId}` : null,
    () => axios.get(`/api/working-hours/user/${targetUserId}`).then(res => res.data),
    {
      revalidateOnFocus: false,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  return {
    workingHoursData: data?.data || null,
    schedule: data?.data?.schedule || null,
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for fetching holidays for a specific week
export const useWeeklyHolidays = (startDate: Date, endDate: Date) => {
  const startDateString = startDate.toISOString().split('T')[0];
  const endDateString = endDate.toISOString().split('T')[0];
  const year = startDate.getFullYear();

  const { data, error, mutate, isLoading } = useSWR<HolidaysResponse>(
    `/api/holidays?year=${year}&start_date=${startDateString}&end_date=${endDateString}`,
    () => axios.get('/api/holidays', {
      params: {
        year,
        start_date: startDateString,
        end_date: endDateString,
      }
    }).then(res => res.data),
    {
      revalidateOnFocus: false,
      refreshInterval: 3600000, // Refresh every hour (holidays don't change often)
    }
  );

  return {
    holidays: data?.data?.data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// Combined hook for weekly schedule
export const useWeeklySchedule = () => {
  const { user } = useAuth({});

  // Get current week dates (Monday to Sunday)
  const getCurrentWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return { monday, sunday };
  };

  const { monday, sunday } = getCurrentWeekDates();
  
  const { schedule, isLoading: workingHoursLoading, isError: workingHoursError } = useWorkingHours(user?.id);
  const { holidays, isLoading: holidaysLoading, isError: holidaysError } = useWeeklyHolidays(monday, sunday);

  // Generate week days array
  const generateWeekDays = (): WeeklyScheduleDay[] => {
    const days: WeeklyScheduleDay[] = [];
    const dayNames: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const indonesianDayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      const dayName = dayNames[i];
      const dayNameIndonesian = indonesianDayNames[i];
      
      // Check if there's a holiday on this date
      const dayHoliday = holidays.find(holiday => {
        const holidayDate = new Date(holiday.date).toISOString().split('T')[0];
        return holidayDate === dateString;
      });
      
      // Get working hours for this day
      const workingHour = schedule?.[dayName] || null;
      
      // Determine status
      let status: 'working' | 'holiday' | 'off' | 'weekend' = 'off';
      
      if (dayHoliday) {
        status = 'holiday';
      } else if (workingHour) {
        status = 'working';
      } else if (dayName === 'saturday' || dayName === 'sunday') {
        status = 'weekend';
      } else {
        status = 'off';
      }
      
      // Format duration
      const formatDuration = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}j ${mins}m`;
      };
      
      days.push({
        date,
        dateString,
        dayName: dayName,
        dayNameIndonesian,
        startTime: workingHour?.start_time ?? null,
        endTime: workingHour?.end_time ?? null,
        duration: workingHour ? formatDuration(workingHour.duration_minutes) : null,
        isHoliday: !!dayHoliday,
        holidayInfo: dayHoliday ?? null,
        isWorkDay: !!workingHour && !dayHoliday,
        status,
      });
    }
    
    return days;
  };

  const weekDays = generateWeekDays();
  
  // Get today's day for highlighting
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  return {
    weekDays,
    currentWeek: {
      start: monday,
      end: sunday,
      startString: monday.toISOString().split('T')[0],
      endString: sunday.toISOString().split('T')[0],
    },
    todayString,
    isLoading: workingHoursLoading ?? holidaysLoading,
    isError: workingHoursError ?? holidaysError,
    schedule,
    holidays,
  };
};