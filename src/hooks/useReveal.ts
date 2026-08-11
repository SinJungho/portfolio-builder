import { useEffect, useRef, useState } from "react";

export default function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 이미 화면 안이면 관찰자를 기다리지 않는다. SSR HTML이 opacity:0을 실어 보내므로
    // IO 콜백이 늦거나 오지 않으면 그대로 빈 화면이 된다.
    if (el.getBoundingClientRect().top < window.innerHeight) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      // threshold 대신 rootMargin으로 선행 트리거한다. threshold는 요소가 클수록
      // 늦게 걸려서, 긴 섹션을 빠르게 스크롤하면 빈 화면 구간이 보였다.
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}
