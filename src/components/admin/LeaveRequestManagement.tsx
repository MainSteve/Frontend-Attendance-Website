import React, { useState } from 'react'

const LeaveRequests = () => {
  const [requests, setRequests] = useState([
    {
      id: 1,
      employee: 'John Doe',
      type: 'Annual',
      startDate: '2025-01-15',
      endDate: '2025-01-17',
      reason: 'Family vacation',
      status: 'pending',
      hasProof: true,
    },
    {
      id: 2,
      employee: 'Jane Smith',
      type: 'Sick',
      startDate: '2025-01-10',
      endDate: '2025-01-10',
      reason: 'Flu',
      status: 'pending',
      hasProof: true,
    },
  ])

  const handleStatusChange = (id: number, newStatus: string) => {
    setRequests(
      requests.map(req =>
        req.id === id ? { ...req, status: newStatus } : req,
      ),
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Permohonan Cuti</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Karyawan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Alasan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bukti
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map(request => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {request.employee}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.startDate} - {request.endDate}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {request.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        request.status,
                      )}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {request.hasProof && (
                      <button className="text-blue-600 hover:text-blue-900">
                        Lihat Bukti
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleStatusChange(request.id, 'approved')
                          }
                          className="text-green-600 hover:text-green-900">
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(request.id, 'rejected')
                          }
                          className="text-red-600 hover:text-red-900">
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
export default LeaveRequests;