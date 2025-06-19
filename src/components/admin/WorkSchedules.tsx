import React, { useState } from 'react';

const WorkSchedules = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [schedule, setSchedule] = useState({
    monday: { start: '09:00', end: '17:00' },
    tuesday: { start: '09:00', end: '17:00' },
    wednesday: { start: '09:00', end: '17:00' },
    thursday: { start: '09:00', end: '17:00' },
    friday: { start: '09:00', end: '17:00' },
    saturday: { start: '', end: '' },
    sunday: { start: '', end: '' },
  });

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = {
    monday: 'Senin',
    tuesday: 'Selasa',
    wednesday: 'Rabu',
    thursday: 'Kamis',
    friday: 'Jumat',
    saturday: 'Sabtu',
    sunday: 'Minggu'
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Jadwal Kerja</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Karyawan</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Pilih karyawan...</option>
            <option value="1">John Doe</option>
            <option value="2">Jane Smith</option>
            <option value="3">Bob Johnson</option>
          </select>
        </div>

        <div className="space-y-4">
          {days.map((day) => (
            <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-32">
                <p className="font-medium text-gray-700">{dayNames[day as keyof typeof dayNames]}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={schedule[day as keyof typeof schedule].start}
                  onChange={(e) => setSchedule({
                    ...schedule,
                    [day]: { ...schedule[day as keyof typeof schedule], start: e.target.value }
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="time"
                  value={schedule[day as keyof typeof schedule].end}
                  onChange={(e) => setSchedule({
                    ...schedule,
                    [day]: { ...schedule[day as keyof typeof schedule], end: e.target.value }
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={schedule[day as keyof typeof schedule].start === '' && schedule[day as keyof typeof schedule].end === ''}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSchedule({
                        ...schedule,
                        [day]: { start: '', end: '' }
                      });
                    } else {
                      setSchedule({
                        ...schedule,
                        [day]: { start: '09:00', end: '17:00' }
                      });
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Libur</span>
              </label>
            </div>
          ))}
        </div>

        <button className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
          Simpan Jadwal
        </button>
      </div>
    </div>
  );
};
export default WorkSchedules;