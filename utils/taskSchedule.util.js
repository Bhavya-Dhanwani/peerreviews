export const MAX_TASK_SCHEDULE_DAYS = 7;

function pad(value) {
  return String(value).padStart(2, "0");
}

export function getDateInputValue(date = new Date()) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
}

export function getScheduleBounds(now = new Date()) {
  const minDate = new Date(now);
  minDate.setHours(0, 0, 0, 0);

  const maxDate = new Date(minDate);
  maxDate.setDate(maxDate.getDate() + MAX_TASK_SCHEDULE_DAYS);

  return {
    minDate,
    maxDate,
    minDateValue: getDateInputValue(minDate),
    maxDateValue: getDateInputValue(maxDate),
  };
}

export function normalizeTaskStartDateInput(value, now = new Date()) {
  const normalized = String(value || "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return {
      ok: false,
      message: "Please choose a valid start date.",
    };
  }

  const [year, month, day] = normalized.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  parsed.setHours(0, 0, 0, 0);

  if (
    parsed.getFullYear() != year ||
    parsed.getMonth() != month - 1 ||
    parsed.getDate() != day
  ) {
    return {
      ok: false,
      message: "Please choose a valid calendar date.",
    };
  }

  const { minDate, maxDate } = getScheduleBounds(now);

  if (parsed < minDate) {
    return {
      ok: false,
      message: "Start date cannot be earlier than today.",
    };
  }

  if (parsed > maxDate) {
    return {
      ok: false,
      message: "Start date can only be planned within the next 7 days.",
    };
  }

  return {
    ok: true,
    value: parsed,
  };
}

export function isTaskScheduled(task, now = new Date()) {
  if (!task?.startDate) {
    return false;
  }

  return new Date(task.startDate) > now;
}

export function buildTaskVisibilityFilter({ includeScheduled = false, now = new Date() } = {}) {
  if (includeScheduled) {
    return {};
  }

  return {
    $or: [
      { startDate: { $exists: false } },
      { startDate: null },
      { startDate: { $lte: now } },
    ],
  };
}
