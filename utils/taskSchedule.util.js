export const MAX_TASK_SCHEDULE_DAYS = 7;
export const MIN_SUBMISSION_DEADLINE_DAYS_FROM_START = 2;

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

export function normalizeTaskStartDateInput(value, options = {}) {
  const now = options instanceof Date ? options : options.now || new Date();
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

export function getMinimumSubmissionDeadlineDate(startDateValue) {
  const startDate = new Date(startDateValue || new Date());
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() + MIN_SUBMISSION_DEADLINE_DAYS_FROM_START);
  return startDate;
}

export function normalizeSubmissionDeadlineInput(value, startDateValue, now = new Date()) {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return {
      ok: false,
      message: "Submission deadline is required.",
    };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return {
      ok: false,
      message: "Please choose a valid submission deadline.",
    };
  }

  const [year, month, day] = normalized.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  parsed.setHours(23, 59, 59, 999);

  if (
    parsed.getFullYear() != year ||
    parsed.getMonth() != month - 1 ||
    parsed.getDate() != day
  ) {
    return {
      ok: false,
      message: "Please choose a valid deadline date.",
    };
  }

  if (startDateValue) {
    const startDate = new Date(startDateValue);
    startDate.setHours(0, 0, 0, 0);
    const minimumDeadlineDate = getMinimumSubmissionDeadlineDate(startDate);

    if (parsed <= startDate) {
      return {
        ok: false,
        message: "Submission deadline must be after the task start date.",
      };
    }

    if (parsed < minimumDeadlineDate) {
      return {
        ok: false,
        message: `Submission deadline must be at least ${MIN_SUBMISSION_DEADLINE_DAYS_FROM_START} days after the task start date.`,
      };
    }
  }

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  if (parsed < today) {
    return {
      ok: false,
      message: "Submission deadline cannot be earlier than today.",
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

export function isSubmissionClosed(task, now = new Date()) {
  if (!task?.submissionDeadline) {
    return false;
  }

  return new Date(task.submissionDeadline) < now;
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
