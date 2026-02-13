import { useEffect, useState } from "react";

function getCurrentStatus() {
  const now = new Date();
  const kst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const day = kst.getDay();
  const minutes = kst.getHours() * 60 + kst.getMinutes();
  const isWeekday = day >= 1 && day <= 5;
  const isSaturday = day === 6;
  const weekdayOpen = minutes >= 510 && minutes <= 1110;
  const saturdayOpen = minutes >= 540 && minutes <= 900;
  const isOpen = (isWeekday && weekdayOpen) || (isSaturday && saturdayOpen);

  return isOpen
    ? { text: "현재 영업 중", className: "badge badge-open" }
    : { text: "영업시간 외", className: "badge badge-closed" };
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

