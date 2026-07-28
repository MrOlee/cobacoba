import { animeKompiAPI } from '@/lib/api';

export default async function SchedulePage() {
  let scheduleData: any = null;

  try {
    const res = await animeKompiAPI.getSchedule();
    scheduleData = res?.data || res;
  } catch (e) {
    console.error('Failed to load schedule', e);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <span className="w-2 h-6 bg-cyan-400 rounded-full"></span> Jadwal Rilis Anime
      </h1>

      {scheduleData && typeof scheduleData === 'object' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(scheduleData).map((day, idx) => (
            <div key={idx} className="bg-gray-900/60 border border-gray-800 p-5 rounded-2xl space-y-3">
              <h2 className="text-lg font-bold text-purple-400 capitalize border-b border-gray-800 pb-2">{day}</h2>
              <div className="space-y-2">
                {Array.isArray(scheduleData[day]) && scheduleData[day].map((anime: any, aIdx: number) => (
                  <div key={aIdx} className="flex items-center justify-between text-xs text-gray-300 py-1 border-b border-gray-800/50 last:border-none">
                    <span className="font-medium text-gray-200">{anime.title || anime.name}</span>
                    <span className="text-purple-300 bg-purple-950 px-2 py-0.5 rounded">{anime.time || 'Update'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">Gagal memuat jadwal rilis.</p>
      )}
    </div>
  );
}
