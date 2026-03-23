import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function formatValue(value, suffix = '', digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/A';
  }

  const numeric = typeof value === 'number' ? value.toFixed(digits) : value;
  return `${numeric}${suffix}`;
}

export function formatHour(isoString) {
  return dayjs(isoString).format('HH:mm');
}

export function formatDay(isoDate) {
  return dayjs(isoDate).format('DD MMM');
}

export function formatDateInput(date) {
  return dayjs(date).format('YYYY-MM-DD');
}

export function formatLocalDateTime(isoString) {
  if (!isoString) {
    return 'N/A';
  }

  return dayjs(isoString).format('DD MMM, HH:mm');
}

export function formatIstTime(isoString) {
  if (!isoString) {
    return 'N/A';
  }

  return dayjs(isoString).tz('Asia/Kolkata').format('DD MMM, HH:mm');
}

export function clampDateRange(startDate, endDate, maxDays = 730) {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
    return { isValid: false, message: 'Please select a valid date range.' };
  }

  const diff = end.diff(start, 'day');

  if (diff > maxDays) {
    return {
      isValid: false,
      message: `Date range cannot exceed ${maxDays} days.`,
    };
  }

  return { isValid: true, message: '' };
}
