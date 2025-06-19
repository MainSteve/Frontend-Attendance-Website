import { 
  Users, 
  Clock,
  Megaphone,
  ChevronRight,
  FileCheck
} from 'lucide-react';
const DashboardOverview = () => {
  const stats = [
    { label: 'Total Karyawan', value: '150', icon: Users, color: 'bg-blue-500' },
    { label: 'Hadir Hari Ini', value: '142', icon: Clock, color: 'bg-green-500' },
    { label: 'Cuti Pending', value: '8', icon: FileCheck, color: 'bg-yellow-500' },
    { label: 'Pengumuman Aktif', value: '3', icon: Megaphone, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Aktivitas Terkini</h2>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">John Doe mengajukan cuti untuk tanggal 25-27 Desember</p>
                <p className="text-xs text-gray-500">2 jam yang lalu</p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default DashboardOverview;