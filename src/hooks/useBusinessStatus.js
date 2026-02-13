import { useEffect, useState } from "react";

const OPEN_BADGE_CLASS =
  "inline-flex rounded-full border border-emerald-300/40 bg-emerald-500/15 px-2.5 py-1 text-[0.7rem] font-extrabold text-emerald-300";
const RESERVATION_BADGE_CLASS =
  "inline-flex rounded-full border border-amber-300/40 bg-amber-500/15 px-2.5 py-1 text-[0.7rem] font-extrabold text-amber-200";
const CLOSED_BADGE_CLASS =
  "inline-flex rounded-full border border-rose-400/35 bg-rose-500/10 px-2.5 py-1 text-[0.7rem] font-extrabold text-rose-200";

function getCurrentStatus() {
  const now = new Date();
  const kst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const day = kst.getDay();
  const minutes = kst.getHours() * 60 + kst.getMinutes();

  const isWeekday = day >= 1 && day <= 5;
  const isSaturday = day === 6;
  const weekdayOpen = minutes >= 540 && minutes <= 1140;

  if (isSaturday) {
    return { text: "토요일 예약제 운영", className: RESERVATION_BADGE_CLASS };
  }

  if (isWeekday && weekdayOpen) {
    return { text: "현재 영업 중", className: OPEN_BADGE_CLASS };
  }

  return { text: "영업시간 외", className: CLOSED_BADGE_CLASS };
}

export function useBusinessStatus() {
  const [status, setStatus] = useState(getCurrentStatus);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setStatus(getCurrentStatus());
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  return status;
}
