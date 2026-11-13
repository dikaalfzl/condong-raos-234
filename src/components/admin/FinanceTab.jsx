import { useState, useEffect, useCallback } from 'react';
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiDownload,
  FiCalendar,
  FiList,
  FiEdit2,
  FiTrash2,
} from 'react-icons/fi';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import CustomDatePicker, { getTodayDateString, formatTanggalIndo } from './CustomDatePicker';

const formatRupiah = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

export default function FinanceTab() {
  const { user, showToast } = useAuth();
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [viewModeFinance, setViewModeFinance] = useState('all');
  const [allFinanceLogs, setAllFinanceLogs] = useState([]);
  const [loadingFinance, setLoadingFinance] = useState(false);
  const [savingFinance, setSavingFinance] = useState(false);
  const [editingFinanceLog, setEditingFinanceLog] = useState(null);
  const [financeForm, setFinanceForm] = useState({
    log_date: getTodayDateString(),
    type: 'pemasukan',
    description: '',
    amount: '',
  });

  const fetchFinancialLogs = useCallback(async () => {
    setLoadingFinance(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('financial_logs')
          .select('*')
          .order('log_date', { ascending: false })
          .order('created_at', { ascending: false });

        if (!error && data) {
          setAllFinanceLogs(data);
          setLoadingFinance(false);
          return;
        }
      }
      const localAll = localStorage.getItem('cr_finance_all_logs');
      setAllFinanceLogs(localAll ? JSON.parse(localAll) : []);
    } catch (err) {
      console.error('Gagal memuat data keuangan:', err.message);
    } finally {
      setLoadingFinance(false);
    }
  }, []);

  useEffect(() => {
    fetchFinancialLogs();
  }, [fetchFinancialLogs]);

  const handleSaveFinanceLog = async (e) => {
    e.preventDefault();
    const numericAmount = Number(String(financeForm.amount).replace(/[^0-9]/g, '')) || 0;

    if (!financeForm.description.trim() || numericAmount <= 0) {
      showToast('Mohon isi keterangan transaksi dan nominal yang valid.', 'error');
      return;
    }

    const targetDate = financeForm.log_date || selectedDate || getTodayDateString();
    setSavingFinance(true);

    try {
      if (editingFinanceLog) {
        const updatedPayload = {
          log_date: targetDate,
          type: financeForm.type,
          description: financeForm.description.trim(),
          amount: numericAmount,
        };

        const { error } = await supabase
          .from('financial_logs')
          .update(updatedPayload)
          .eq('id', editingFinanceLog.id);

        if (error) {
          const updatedLocal = allFinanceLogs.map((item) =>
            item.id === editingFinanceLog.id ? { ...item, ...updatedPayload } : item
          );
          localStorage.setItem('cr_finance_all_logs', JSON.stringify(updatedLocal));
          setAllFinanceLogs(updatedLocal);
        } else {
          await fetchFinancialLogs();
        }
        showToast('Catatan keuangan berhasil diperbarui!', 'success');
      } else {
        const newEntry = {
          log_date: targetDate,
          type: financeForm.type,
          category: financeForm.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran',
          description: financeForm.description.trim(),
          qty: 1,
          amount: numericAmount,
          created_by: user?.id || null,
        };

        const { error } = await supabase.from('financial_logs').insert(newEntry);

        if (error) {
          const fallbackList = [
            { ...newEntry, id: Date.now(), created_at: new Date().toISOString() },
            ...allFinanceLogs,
          ];
          localStorage.setItem('cr_finance_all_logs', JSON.stringify(fallbackList));
          setAllFinanceLogs(fallbackList);
        } else {
          await fetchFinancialLogs();
        }
        showToast('Catatan keuangan berhasil ditambahkan!', 'success');
      }

      setEditingFinanceLog(null);
      setFinanceForm({
        log_date: targetDate,
        type: financeForm.type,
        description: '',
        amount: '',
      });
    } catch (err) {
      showToast(`Gagal menyimpan catatan: ${err.message}`, 'error');
    } finally {
      setSavingFinance(false);
    }
  };

  const handleStartEditFinance = (log) => {
    setEditingFinanceLog(log);
    setFinanceForm({
      log_date: log.log_date || selectedDate,
      type: log.type || 'pemasukan',
      description: log.description || '',
      amount: String(log.amount || ''),
    });
  };

  const handleDeleteFinanceLog = async (id) => {
    if (!window.confirm('Hapus catatan transaksi ini?')) return;
    try {
      const { error } = await supabase.from('financial_logs').delete().eq('id', id);
      if (error) {
        const filtered = allFinanceLogs.filter((item) => item.id !== id);
        localStorage.setItem('cr_finance_all_logs', JSON.stringify(filtered));
        setAllFinanceLogs(filtered);
      } else {
        await fetchFinancialLogs();
      }
      if (editingFinanceLog?.id === id) {
        setEditingFinanceLog(null);
        setFinanceForm({
          log_date: selectedDate,
          type: 'pemasukan',
          description: '',
          amount: '',
        });
      }
      showToast('Catatan transaksi dihapus.', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Total seluruh hari yang memiliki transaksi (tidak berubah jadi 0 saat filter tanggal kosong)
  const allDatesWithTransactions = Array.from(
    new Set(allFinanceLogs.map((i) => i.log_date))
  );

  const displayedFinanceLogs =
    viewModeFinance === 'all'
      ? allFinanceLogs
      : allFinanceLogs.filter((item) => item.log_date === selectedDate);

  const groupedByDate = displayedFinanceLogs.reduce((acc, item) => {
    const d = item.log_date || getTodayDateString();
    if (!acc[d]) {
      acc[d] = { date: d, items: [], pemasukan: 0, pengeluaran: 0 };
    }
    acc[d].items.push(item);
    if (item.type === 'pemasukan') {
      acc[d].pemasukan += Number(item.amount || 0);
    } else {
      acc[d].pengeluaran += Number(item.amount || 0);
    }
    return acc;
  }, {});

  const dailyRecapList = Object.values(groupedByDate).sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const totalPemasukan = displayedFinanceLogs
    .filter((i) => i.type === 'pemasukan')
    .reduce((sum, i) => sum + Number(i.amount || 0), 0);

  const totalPengeluaran = displayedFinanceLogs
    .filter((i) => i.type === 'pengeluaran')
    .reduce((sum, i) => sum + Number(i.amount || 0), 0);

  const labaBersih = totalPemasukan - totalPengeluaran;

  const handleExportCSV = () => {
    if (displayedFinanceLogs.length === 0) {
      showToast('Belum ada data transaksi untuk diekspor.', 'info');
      return;
    }

    const headers = ['No', 'Tanggal', 'Waktu', 'Jenis', 'Keterangan', 'Nominal (Rp)'];
    const rows = displayedFinanceLogs.map((item, idx) => [
      idx + 1,
      item.log_date || selectedDate,
      new Date(item.created_at).toLocaleTimeString('id-ID'),
      item.type.toUpperCase(),
      `"${(item.description || '').replace(/"/g, '""')}"`,
      item.amount || 0,
    ]);

    rows.push([]);
    rows.push(['', '', '', '', 'TOTAL PEMASUKAN', totalPemasukan]);
    rows.push(['', '', '', '', 'TOTAL PENGELUARAN', totalPengeluaran]);
    rows.push(['', '', '', '', 'SALDO / LABA BERSIH', labaBersih]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const suffix = viewModeFinance === 'all' ? 'Semua-Rekap' : selectedDate;
    link.download = `Laporan-Keuangan-CondongRaos-${suffix}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('File CSV berhasil diunduh!', 'success');
  };

  const handleExportExcel = () => {
    if (displayedFinanceLogs.length === 0) {
      showToast('Belum ada data transaksi untuk diekspor.', 'info');
      return;
    }

    const tableRows = displayedFinanceLogs
      .map(
        (item, idx) => `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td>${item.log_date || selectedDate}</td>
          <td>${new Date(item.created_at).toLocaleTimeString('id-ID')}</td>
          <td style="color:${item.type === 'pemasukan' ? '#1E8449' : '#9a1006'};font-weight:bold;">
            ${item.type.toUpperCase()}
          </td>
          <td>${item.description}</td>
          <td style="text-align:right;">${Number(item.amount || 0)}</td>
        </tr>`
      )
      .join('');

    const suffix = viewModeFinance === 'all' ? 'Semua Rekap Harian' : selectedDate;
    const excelHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="UTF-8"></head>
      <body>
        <h3>LAPORAN KEUANGAN - BAKSO & MIE AYAM CONDONG RAOS 234</h3>
        <p>Periode Laporan: <strong>${suffix}</strong></p>
        <table border="1" cellpadding="6" cellspacing="0">
          <thead>
            <tr style="background:#9a1006;color:#FFFFFF;font-weight:bold;">
              <th>No</th>
              <th>Tanggal</th>
              <th>Jam</th>
              <th>Jenis Transaksi</th>
              <th>Keterangan</th>
              <th>Nominal (Rp)</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
            <tr><td colspan="6"></td></tr>
            <tr style="font-weight:bold;background:#EAFAF1;">
              <td colspan="5">TOTAL PEMASUKAN</td>
              <td style="text-align:right;">${totalPemasukan}</td>
            </tr>
            <tr style="font-weight:bold;background:#FDEDEC;">
              <td colspan="5">TOTAL PENGELUARAN</td>
              <td style="text-align:right;">${totalPengeluaran}</td>
            </tr>
            <tr style="font-weight:bold;background:#FEF9E7;">
              <td colspan="5">SALDO / LABA BERSIH</td>
              <td style="text-align:right;">${labaBersih}</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelHTML], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileLabel = viewModeFinance === 'all' ? 'Semua-Rekap' : selectedDate;
    link.download = `Laporan-Keuangan-CondongRaos-${fileLabel}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('File Excel (.xls) berhasil diunduh!', 'success');
  };

  return (
    <div className="finance-section-wrapper">
      {/* PANEL KONTROL ATAS YANG RATA PENUH, RAPI, DAN SIMETRIS */}
      {/* PANEL KONTROL ATAS YANG RATA PENUH 50:50 TANPA CELAH KOSONG */}
      <div className="cr-finance-toolbar">
        {/* BARIS 1: 2 TOMBOL TAB MODE RATA PENUH (50% : 50%) */}
        <div className="cr-finance-segmented">
          <button
            type="button"
            onClick={() => setViewModeFinance('all')}
            className={`cr-seg-btn ${viewModeFinance === 'all' ? 'active' : ''}`}
          >
            <FiList size={15} />
            <span>Semua Rekap ({allDatesWithTransactions.length} Hari)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewModeFinance('single')}
            className={`cr-seg-btn ${viewModeFinance === 'single' ? 'active' : ''}`}
          >
            <FiCalendar size={15} />
            <span>Filter Per Tanggal</span>
          </button>
        </div>

        {/* BARIS 2 (JIKA FILTER TANGGAL AKTIF): PEMILIH TANGGAL */}
        {viewModeFinance === 'single' && (
          <div className="cr-finance-date-row">
            <CustomDatePicker
              value={selectedDate}
              onChange={(newDate) => setSelectedDate(newDate)}
              highlightedDates={allDatesWithTransactions}
            />
          </div>
        )}

        {/* BARIS 3: 2 TOMBOL EXPORT RATA PENUH (50% : 50%) */}
        <div className="cr-export-grid">
          <button type="button" onClick={handleExportExcel} className="btn-export-excel">
            <FiDownload size={15} />
            <span>Export Excel (.xls)</span>
          </button>
          <button type="button" onClick={handleExportCSV} className="btn-export-csv">
            <FiDownload size={15} />
            <span>Export CSV (.csv)</span>
          </button>
        </div>
      </div>

      {/* KARTU RINGKASAN */}
      <div className="finance-summary-grid">
        <div className="finance-stat-card income">
          <div className="stat-icon">
            <FiTrendingUp size={22} />
          </div>
          <div>
            <span>
              Total Pemasukan ({viewModeFinance === 'all' ? 'Semua Hari' : selectedDate})
            </span>
            <h4>{formatRupiah(totalPemasukan)}</h4>
          </div>
        </div>

        <div className="finance-stat-card expense">
          <div className="stat-icon">
            <FiTrendingDown size={22} />
          </div>
          <div>
            <span>
              Total Pengeluaran ({viewModeFinance === 'all' ? 'Semua Hari' : selectedDate})
            </span>
            <h4>{formatRupiah(totalPengeluaran)}</h4>
          </div>
        </div>

        <div className="finance-stat-card balance">
          <div className="stat-icon">
            <FiDollarSign size={22} />
          </div>
          <div>
            <span>
              Laba / Saldo Bersih (
              {viewModeFinance === 'all' ? 'Total Keseluruhan' : 'Hari Ini'})
            </span>
            <h4>{formatRupiah(labaBersih)}</h4>
          </div>
        </div>
      </div>

      {/* FORM INPUT & DAFTAR REKAP HARIAN */}
      <div className="admin-split-grid">
        <form onSubmit={handleSaveFinanceLog} className="admin-form-card">
          <h3>
            {editingFinanceLog ? '✏️ Edit Catatan Transaksi' : '📝 Catat Transaksi Baru'}
          </h3>

          <label>Tanggal Transaksi</label>
          <CustomDatePicker
            value={financeForm.log_date}
            onChange={(newDate) => setFinanceForm({ ...financeForm, log_date: newDate })}
            highlightedDates={allDatesWithTransactions}
          />

          <label>Jenis Transaksi</label>
          <div className="finance-type-switch">
            <button
              type="button"
              onClick={() => setFinanceForm({ ...financeForm, type: 'pemasukan' })}
              className={`type-pill ${financeForm.type === 'pemasukan' ? 'active-in' : ''}`}
            >
              ➕ Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setFinanceForm({ ...financeForm, type: 'pengeluaran' })}
              className={`type-pill ${financeForm.type === 'pengeluaran' ? 'active-out' : ''}`}
            >
              ➖ Pengeluaran
            </button>
          </div>

          <label>Keterangan Transaksi</label>
          <input
            type="text"
            placeholder={
              financeForm.type === 'pemasukan'
                ? 'Contoh: Penjualan Bakso & Mie Ayam'
                : 'Contoh: Belanja Daging Sapi & Gas'
            }
            value={financeForm.description}
            onChange={(e) => setFinanceForm({ ...financeForm, description: e.target.value })}
            required
          />

          <label>Nominal (Rp)</label>
          <input
            type="text"
            placeholder="Contoh: 150000"
            value={financeForm.amount}
            onChange={(e) => setFinanceForm({ ...financeForm, amount: e.target.value })}
            required
          />

          <div className="admin-action-btns-row">
            <button
              type="submit"
              disabled={savingFinance}
              className="admin-save-btn btn-sweep-red-to-white"
            >
              <span>
                {savingFinance
                  ? 'Menyimpan...'
                  : editingFinanceLog
                  ? 'Simpan Perubahan'
                  : 'Simpan Transaksi'}
              </span>
            </button>

            {editingFinanceLog && (
              <button
                type="button"
                onClick={() => {
                  setEditingFinanceLog(null);
                  setFinanceForm({
                    log_date: getTodayDateString(),
                    type: 'pemasukan',
                    description: '',
                    amount: '',
                  });
                }}
                className="admin-cancel-btn"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        {/* DAFTAR REKAP HARIAN TANPA TOMBOL HAPUS HARI INI */}
        <div className="admin-list-card">
          <h3>
            📋{' '}
            {viewModeFinance === 'all'
              ? `Semua Rekap Harian (${dailyRecapList.length} Hari • ${displayedFinanceLogs.length} Transaksi)`
              : `Rekap Tanggal ${formatTanggalIndo(selectedDate)} (${displayedFinanceLogs.length})`}
          </h3>

          {loadingFinance ? (
            <p style={{ fontSize: '0.85rem', color: '#666' }}>Memuat catatan keuangan...</p>
          ) : dailyRecapList.length === 0 ? (
            <div className="finance-empty-state">
              Belum ada catatan pemasukan atau pengeluaran pada periode ini.
            </div>
          ) : (
            <div className="daily-recap-groups">
              {dailyRecapList.map((group) => {
                const netDay = group.pemasukan - group.pengeluaran;
                return (
                  <div key={group.date} className="daily-recap-card">
                    <div className="daily-recap-header">
                      <div className="daily-recap-date">
                        📅 {formatTanggalIndo(group.date)}
                      </div>
                      <div className="daily-recap-badges">
                        <span className="recap-pill in">
                          Masuk: {formatRupiah(group.pemasukan)}
                        </span>
                        <span className="recap-pill out">
                          Keluar: {formatRupiah(group.pengeluaran)}
                        </span>
                        <span className="recap-pill net">
                          Bersih: {formatRupiah(netDay)}
                        </span>
                      </div>
                    </div>

                    <div className="admin-items-list">
                      {group.items.map((log) => (
                        <div key={log.id} className="finance-log-row">
                          <div
                            className={`finance-badge-type ${
                              log.type === 'pemasukan' ? 'in' : 'out'
                            }`}
                          >
                            {log.type === 'pemasukan' ? '+' : '-'}
                          </div>

                          <div className="admin-row-info">
                            <strong>{log.description}</strong>
                            <span>
                              {log.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'} •{' '}
                              {new Date(log.created_at).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <div
                            className={`finance-amount-text ${
                              log.type === 'pemasukan' ? 'in' : 'out'
                            }`}
                          >
                            {log.type === 'pemasukan' ? '+' : '-'} {formatRupiah(log.amount)}
                          </div>

                          <div className="admin-row-actions">
                            <button
                              type="button"
                              onClick={() => handleStartEditFinance(log)}
                              className="act-edit"
                              title="Edit transaksi ini"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteFinanceLog(log.id)}
                              className="act-del"
                              title="Hapus transaksi ini"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}