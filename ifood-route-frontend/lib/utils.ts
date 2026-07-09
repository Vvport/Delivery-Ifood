export function getWaitMinutes(createdAt: string, now: number): number {
  return Math.floor((now - new Date(createdAt).getTime()) / 60000);
}

export function isOrderLate(createdAt: string, now: number, lateThresholdMinutes: number): boolean {
  return getWaitMinutes(createdAt, now) >= lateThresholdMinutes;
}
