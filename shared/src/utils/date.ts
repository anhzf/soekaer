// Make date to the start of the day
export const day00 = (date = new Date()) => new Date(date.setHours(0, 0, 0, 0));

// Make date to the end of the day
export const day24 = (date = new Date()) => new Date(date.setHours(23, 59, 59, 999));
