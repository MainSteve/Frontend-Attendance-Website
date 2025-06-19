import React, { useState } from 'react';

const LeaveQuotaManagement = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [quotas, setQuotas] = useState({
    annual: 12,
    sick: 5,
    personal: 3
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Manajemen Jatah Cuti</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Karyawan</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih karyawan...</option>
            <option value="1">John Doe</option>
            <option value="2">Jane Smith</option>
            <option value="3">Bob Johnson</option>
          </select>
        </div>

        {selectedEmployee && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cuti Tahunan</label>
                <input
                  type="number"
                  value={quotas.annual}
                  onChange={(e) => setQuotas({...quotas, annual: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cuti Sakit</label>
                <input
                  type="number"
                  value={quotas.sick}
                  onChange={(e) => setQuotas({...quotas, sick: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cuti Personal</label>
                <input
                  type="number"
                  value={quotas.personal}
                  onChange={(e) => setQuotas({...quotas, personal: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Update Jatah Cuti
            </button>
          </div>
        )}
      </div>

      {/* Generate Yearly Quotas */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Generate Jatah Cuti Tahunan</h2>
        <p className="text-gray-600 mb-4">Generate jatah cuti untuk semua karyawan untuk tahun berjalan</p>
        <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
          Generate Jatah Cuti 2025
        </button>
      </div>
    </div>
  );
};
export default LeaveQuotaManagement;