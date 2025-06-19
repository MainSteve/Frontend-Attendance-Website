import React, { useState } from 'react';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: 'Update Kebijakan WFH',
      content: 'Mulai bulan depan, kebijakan WFH akan diperbarui...',
      departments: ['IT', 'HR'],
      active: true,
      createdAt: '2025-01-10'
    }
  ]);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    departments: [] as string[],
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Pengumuman</h1>
      
      {/* Create Announcement */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Buat Pengumuman Baru</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
            <input
              type="text"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
            <textarea
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <div className="space-y-2">
              {['IT', 'HR', 'Finance'].map((dept) => (
                <label key={dept} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newAnnouncement.departments.includes(dept)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewAnnouncement({
                          ...newAnnouncement,
                          departments: [...newAnnouncement.departments, dept]
                        });
                      } else {
                        setNewAnnouncement({
                          ...newAnnouncement,
                          departments: newAnnouncement.departments.filter(d => d !== dept)
                        });
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{dept}</span>
                </label>
              ))}
            </div>
          </div>

          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            Publish Pengumuman
          </button>
        </div>
      </div>

      {/* Announcement List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Daftar Pengumuman</h2>
        </div>
        <div className="divide-y">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{announcement.title}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    announcement.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {announcement.active ? 'Active' : 'Inactive'}
                  </span>
                  <button className="text-blue-600 hover:text-blue-900 text-sm">Toggle</button>
                </div>
              </div>
              <p className="text-gray-600 mb-2">{announcement.content}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Departments: {announcement.departments.join(', ')}</span>
                <span>Created: {announcement.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Announcements;