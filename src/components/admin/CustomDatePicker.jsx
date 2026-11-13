import { useState, useEffect, useRef } from 'react';
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export const getTodayDateString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().split('T')[0];
};

export const formatTanggalIndo = (dateStr) => {
  if (!dateStr) return '-';
  try {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const BULAN_INDO = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const HARI_SINGKAT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function CustomDatePicker({ value, onChange, highlightedDates = [] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const initialDate = value ? new Date(`${value}T00:00:00`) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(`${value}T00:00:00`);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  };

  const todayStr = getTodayDateString();
  const calendarCells = [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarCells.push({ day: daysInPrevMonth - i, currentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const fullStr = `${viewYear}-${mm}-${dd}`;
    calendarCells.push({
      day: d,
      currentMonth: true,
      dateStr: fullStr,
      isSelected: fullStr === value,
      isToday: fullStr === todayStr,
      hasData: highlightedDates.includes(fullStr),
    });
  }
  while (calendarCells.length % 7 !== 0) {
    calendarCells.push({
      day: calendarCells.length - (firstDayOfMonth + daysInMonth) + 1,
      currentMonth: false,
    });
  }

  return (
    <div className="cr-datepicker-wrap" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`cr-datepicker-trigger ${open ? 'active' : ''}`}
      >
        <div className="cr-trigger-left">
          <span className="cr-cal-badge">
            <FiCalendar size={15} />
          </span>
          <span className="cr-trigger-text">{formatTanggalIndo(value)}</span>
        </div>
        <span className="cr-trigger-Sub">Pilih Tanggal</span>
      </button>

      {open && (
        <div className="cr-calendar-popover">
          <div className="cr-cal-header">
            <button type="button" onClick={handlePrevMonth} className="cr-cal-nav-btn">
              <FiChevronLeft size={18} />
            </button>
            <div className="cr-cal-title">
              {BULAN_INDO[viewMonth]} {viewYear}
            </div>
            <button type="button" onClick={handleNextMonth} className="cr-cal-nav-btn">
              <FiChevronRight size={18} />
            </button>
          </div>

          <div className="cr-cal-weekdays">
            {HARI_SINGKAT.map((h, i) => (
              <div key={h} className={`cr-weekday-name ${i === 0 ? 'sunday' : ''}`}>
                {h}
              </div>
            ))}
          </div>

          <div className="cr-cal-days-grid">
            {calendarCells.map((cell, idx) =>
              !cell.currentMonth ? (
                <div key={idx} className="cr-cal-day muted">
                  {cell.day}
                </div>
              ) : (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(cell.day)}
                  className={`cr-cal-day ${cell.isSelected ? 'selected' : ''} ${
                    cell.isToday && !cell.isSelected ? 'today' : ''
                  }`}
                >
                  <span>{cell.day}</span>
                  {cell.hasData && <span className="cr-day-dot" />}
                </button>
              )
            )}
          </div>

          <div className="cr-cal-footer">
            <button
              type="button"
              onClick={() => {
                onChange(todayStr);
                setOpen(false);
              }}
              className="cr-cal-today-btn"
            >
              📍 Pilih Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cr-cal-close-btn"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}