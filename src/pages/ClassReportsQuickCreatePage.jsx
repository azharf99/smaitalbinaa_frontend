import React, { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import Modal from '../common/Modal.jsx';
import { useApiService } from '../context/ApiServiceContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_CHOICES = ['Hadir', 'Izin', 'Sakit', 'Tanpa Keterangan'];

// Kelas target: 10A..10E, 11A..11E, 12A..12E
 const TARGET_CLASSES = [
   '10A','10B','10C','10D','10E','10F',
   '11A','11B','11C','11D','11E',
   '12A','12B','12C','12D','12E'
 ];

const TIMES = [1,2,3,4,5,6,7,8,9];

const ClassReportsQuickCreatePage = () => {
  const apiService = useApiService();
  const { authHeader } = useAuth();

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gridData, setGridData] = useState({});
  const [reportersByTime, setReportersByTime] = useState({}); // { [timeNo]: { id, teacher_name } }

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCell, setActiveCell] = useState(null); // {reportId, timeNo, className, data}
  const [modalForm, setModalForm] = useState({ status: 'Hadir', subtitute_teacher_id: '', notes: '' });

  // Reporter modal state (untuk set Petugas Piket per baris/jam)
  const [isReporterModalOpen, setIsReporterModalOpen] = useState(false);
  const [activeTimeNo, setActiveTimeNo] = useState(null);
  const [reporterForm, setReporterForm] = useState({ reporter_id: '' });

  const jsonHeaders = useMemo(() => ({ 'Content-Type': 'application/json', ...authHeader() }), [authHeader]);

  const fetchTeachers = async (type) => {
    const res = await apiService.get(`teachers/?type=${type}`);
    return res.data.results || res.data;
  };

  const weekdayFromDate = (isoDate) => {
    // Map JS getDay() -> nama hari API (Senin..Ahad), JS: 0=Ahad,1=Senin,...
    const map = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const d = new Date(isoDate);
    const idx = d.getDay();
    return map[idx] || 'Senin';
  };

  const getReportType = () => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('type');
    return t === 'putri' ? 'putri' : 'putra';
  };

  const fetchReporterSchedulesForDate = async (date) => {
    const dayName = weekdayFromDate(date);
    const type = getReportType();
    // Cari by search=nama hari; filter type di client
    // Ambil semua halaman jika paginated
    let url = `reporter-schedules/?search=${encodeURIComponent(dayName)}&type=${type}`;
    const collected = [];
    while (url) {
      const res = await apiService.get(url);
      const data = res.data;
      const results = data.results || data || [];
      collected.push(...results);
      url = data.next ? data.next.replace(apiService.defaults.baseURL, '') : null;
    }
    const filtered = collected.filter(item => item.type === type && item.schedule_day === dayName);
    const byTime = {};
    for (const it of filtered) {
      const tNo = parseInt(String(it.schedule_time).trim(), 10);
      if (!Number.isNaN(tNo) && TIMES.includes(tNo)) {
        byTime[tNo] = it.reporter; // { id, teacher_name }
      }
    }
    setReportersByTime(byTime);
    return byTime;
  };

  // Backend endpoints yang diasumsikan:
  // - GET class-reports/quick-grid/?date=YYYY-MM-DD&classes=10A,10B,...&times=1,2,...,9
  //   -> mengembalikan objek { [timeNo]: { [className]: reportObject|null } }
  //   reportObject mirip dengan data di ClassReportsPage
  // - POST class-reports/quick-grid/generate/ { date, classes:[], times:[] }
  //   -> generate data jika belum ada
  // - PATCH class-reports/:id/ untuk update status, subtitute_teacher, notes

  const ensureAndLoadGrid = async (date) => {
    setIsLoading(true);
    setError(null);
    try {
      // Ambil semua halaman lalu bentuk grid: { [timeNo]: { [className]: report } }
      const params = new URLSearchParams({ date });
      // Refetch pasca-generate
      let url = `class-reports/?${params.toString()}`;
      let res = await apiService.get(url);
      let pageResults = res.data || [];

      if (pageResults.length === 0) {
      // Jika data ada, generate berdasarkan tanggal lalu refetch
      await apiService.post('my-class-reports/quick-grid/generate/', {
        date
      });

      // Refetch pasca-generate
        url = `class-reports/?${params.toString()}`;
        res = await apiService.get(url);
        pageResults = res.data || [];
      }

      // Bentuk grid
      const grid = {};
      TIMES.forEach((t) => { grid[t] = {}; });

      for (const item of pageResults) {
        const cls = item?.schedule?.schedule_class;
        if (!TARGET_CLASSES.includes(cls)) continue; // abaikan kelas di luar target
        const timeText = item?.schedule?.schedule_time || '';
        const timeNo = parseInt(String(timeText).trim(), 10);
        if (!TIMES.includes(timeNo)) continue;
        grid[timeNo][cls] = item;
      }

      setGridData(grid);
    } catch (e) {
      console.error(e);
      setError('Gagal memuat data grid.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const [tchs] = await Promise.all([
          fetchTeachers(getReportType()), 
        ]);
        if (!mounted) return;
        setTeachers(tchs);
      } catch (e) {
        console.error(e);
        setError('Gagal memuat data awal.');
      } finally {
        setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    (async () => {
      await ensureAndLoadGrid(selectedDate);
      await fetchReporterSchedulesForDate(selectedDate);
    })();
  }, [selectedDate]);

  const openModalForCell = (report) => {
    setActiveCell(report);
    setModalForm({
      status: report?.status || 'Hadir',
      subtitute_teacher_id: report?.subtitute_teacher?.id || '',
      notes: report?.notes || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveCell(null);
  };

  const openReporterModalForTime = (timeNo) => {
    setActiveTimeNo(timeNo);
    setReporterForm({ reporter_id: '' });
    setIsReporterModalOpen(true);
  };

  const closeReporterModal = () => {
    setIsReporterModalOpen(false);
    setActiveTimeNo(null);
  };

  const submitModal = async (e) => {
    e.preventDefault();
    if (!activeCell?.id) { closeModal(); return; }
    try {
      await apiService.patch(`class-reports/${activeCell.id}/`, {
        status: modalForm.status,
        subtitute_teacher_id: modalForm.subtitute_teacher_id || null,
        notes: modalForm.notes,
      }, { headers: jsonHeaders });
      await ensureAndLoadGrid(selectedDate);
      closeModal();
    } catch (e) {
      console.error(e);
      setError('Gagal menyimpan perubahan.');
    }
  };

  const submitReporterModal = async (e) => {
    e.preventDefault();
    if (!activeTimeNo || !reporterForm.reporter_id) { closeReporterModal(); return; }
    try {
      // Endpoint asumsi untuk set reporter satu baris (semua report pada jam tsb & tanggal):
      // POST my-class-reports/quick-grid/set-reporter/ { date, time_no, reporter_id }
      await apiService.post('my-class-reports/quick-grid/set-reporter/', {
        date: selectedDate,
        time_no: activeTimeNo,
        reporter_id: reporterForm.reporter_id,
      }, { headers: jsonHeaders });
      await ensureAndLoadGrid(selectedDate);
      closeReporterModal();
    } catch (e) {
      console.error(e);
      setError('Gagal menyimpan petugas piket.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Class Reports - Quick Create</h1>

      <div className="mb-4 flex items-center gap-2">
        <label className="text-gray-800 dark:text-gray-200">Tanggal</label>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
      </div>

      {error && (
        <div className="mb-4 p-2 rounded bg-red-100 text-red-700">{error}</div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2"><LoadingSpinner /><span>Loading...</span></div>
      ) : (
        <div className="overflow-auto bg-white dark:bg-slate-800 rounded-md shadow-lg">
          <table className="table-auto border-collapse w-full min-w-[1000px]">
            <caption className="my-2 font-bold">Grid Laporan {selectedDate}</caption>
            <thead>
              <tr>
                <th className="p-2 border border-gray-400 bg-blue-100 text-black sticky left-0 top-0">Jam</th>
                {TARGET_CLASSES.map((cls) => (
                  <th key={cls} className="p-2 border border-gray-400 bg-blue-100 text-black sticky top-0">{cls}</th>
                ))}
                <th className="p-2 border border-gray-400 bg-blue-100 text-black sticky top-0">Petugas Piket</th>
              </tr>
            </thead>
            <tbody>
              {TIMES.map((timeNo) => (
                <tr key={timeNo}>
                  <td className="p-2 border border-gray-400 text-center bg-blue-100 text-black sticky left-0 font-bold">{timeNo}</td>
                  {TARGET_CLASSES.map((cls) => {
                    const report = gridData?.[timeNo]?.[cls] || null;
                    const status = report?.status || '';
                    const teacherShort = report?.schedule?.schedule_course.split(' | ')[1] || '';
                    // schedule_course di API adalah string gabungan: "Mapel | Nama Guru".
                    // Kita tampilkan schedule_course apa adanya agar konsisten.
                    const courseShort = report?.schedule?.schedule_course.split(' | ')[0] || '';
                    const color = status === 'Hadir' ? 'bg-green-500' : status === 'Izin' ? 'bg-yellow-600' : status === 'Sakit' ? 'bg-indigo-500' : status === 'Tanpa Keterangan' ? 'bg-red-500' : 'bg-gray-400';
                    return (
                      <td key={`${timeNo}-${cls}`} className="p-2 border border-gray-400 text-center text-black dark:text-white align-top">
                        {report ? (
                          <button type="button" onClick={() => openModalForCell(report)} className={`p-1 rounded-md text-sm font-semibold hover:bg-fuchsia-400 dark:hover:bg-gray-700 w-20 ${color}`}>
                            {status || 'Set'}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                        <div className="mt-1 text-xs">
                          {teacherShort && <p className="text-center">{teacherShort}</p>}
                          {courseShort && <p className="text-center">{courseShort}</p>}
                        </div>
                      </td>
                    );
                  })}
                  {/* Kolom Petugas Piket kanan */}
                  <td className="p-2 border border-gray-400 text-center align-top">
                    <button
                      type="button"
                      className="bg-teal-500 p-1 rounded-md text-xs text-black dark:text-white font-semibold hover:bg-fuchsia-400 dark:hover:bg-gray-700 w-32"
                      onClick={() => openReporterModalForTime(timeNo)}
                    >
                      Petugas Piket
                    </button>
                    {/* Tampilkan nama reporter (ambil dari salah satu report dalam baris jika ada) */}
                    <div className="text-xs mt-1 text-black dark:text-white">
                      {(() => {
                        // Prioritas: jadwal reporter -> fallback ke data report baris
                        const scheduled = reportersByTime?.[timeNo]?.teacher_name;
                        if (scheduled) return <p className="text-center">{scheduled}</p>;
                        const anyReport = TARGET_CLASSES.map((c) => gridData?.[timeNo]?.[c]).find(Boolean);
                        const reporterName = anyReport?.reporter_short_name || anyReport?.reporter?.short_name || '';
                        return <p className="text-center">{reporterName || 'Tidak ada'}</p>;
                      })()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title="Ubah Status Guru">
          <form onSubmit={submitModal} className="p-2 space-y-3">
            <div>
              <label className="label-style">Status</label>
              <select className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" value={modalForm.status} onChange={(e) => setModalForm((p) => ({ ...p, status: e.target.value }))}>
                {STATUS_CHOICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label-style">Guru Pengganti</label>
              <select className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" value={modalForm.subtitute_teacher_id || ''} onChange={(e) => setModalForm((p) => ({ ...p, subtitute_teacher_id: e.target.value }))}>
                <option value="">— Belum dipilih —</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.teacher_name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-style">Keterangan</label>
              <textarea className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 w-full" rows={2} value={modalForm.notes} onChange={(e) => setModalForm((p) => ({ ...p, notes: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600" onClick={closeModal}>Batal</button>
              <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium shadow disabled:opacity-60 disabled:cursor-not-allowed">Simpan</button>
            </div>
          </form>
        </Modal>
      )}

      {isReporterModalOpen && (
        <Modal isOpen={isReporterModalOpen} onClose={closeReporterModal} title="Set Petugas Piket">
          <form onSubmit={submitReporterModal} className="p-2 space-y-3">
            <div>
              <label className="label-style">Tanggal</label>
              <input className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" type="text" value={selectedDate} disabled />
            </div>
            <div>
              <label className="label-style">Jam</label>
              <input className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" type="text" value={activeTimeNo || ''} disabled />
            </div>
            <div>
              <label className="label-style">Petugas Piket</label>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                value={reporterForm.reporter_id || reportersByTime?.[activeTimeNo]?.id || ''}
                onChange={(e) => setReporterForm((p) => ({ ...p, reporter_id: e.target.value }))}
                required
              >
                <option value="">— Belum dipilih —</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.teacher_name}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600" onClick={closeReporterModal}>Batal</button>
              <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium shadow disabled:opacity-60 disabled:cursor-not-allowed">Simpan</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ClassReportsQuickCreatePage;


