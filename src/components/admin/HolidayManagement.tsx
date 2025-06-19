import exp from 'constants';
import React, { useState } from 'react';

const HolidayManagement = () => {
  const [holidays, setHolidays] = useState([
    { id: 1, name: 'Tahun Baru', date: '2025-01-01', type: 'National' },
    { id: 2, name: 'Hari Kemerdekaan', date: '2025-08-17', type: 'National' },
  ]);

  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: '',
    type: 'National'
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Manajemen Hari Libur</h1>
      
      {/* Add Holiday Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Tambah Hari Libur</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Nama hari libur"
            value={newHoliday.name}
            onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={newHoliday.date}
            onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newHoliday.type}
            onChange={(e) => setNewHoliday({...newHoliday, type: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="National">Nasional</option>
            <option value="Company">Perusahaan</option>
          </select>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            Tambah
          </button>
        </div>
      </div>

      {/* Holiday List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {holidays.map((holiday) => (
                <tr key={holiday.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{holiday.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{holiday.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{holiday.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default HolidayManagement;