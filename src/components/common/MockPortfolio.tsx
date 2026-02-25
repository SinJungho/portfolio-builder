"use client";

import styles from "@/styles/MockPortfolio.module.css";
import { useState } from "react";

// 기여도 셀의 CSS 클래스명을 반환
function generateContributionClasses(): string[] {
  return Array.from({ length: 364 }).map(() => {
    const intensity = Math.random();
    if (intensity < 0.4) return styles.bgLevel0;
    if (intensity < 0.6) return styles.bgLevel1;
    if (intensity < 0.8) return styles.bgLevel2;
    return styles.bgLevel3;
  });
}

export default function MockPortfolio() {
  const [contributionClasses] = useState<string[]>(generateContributionClasses);

  return (
    <div className={styles.outerContainer}>
      {/* Mock browser bar */}
      <div className={styles.browserBar}>
        <div className={styles.browserDots}>
          <div className={`${styles.dot} ${styles.dotRed}`} />
          <div className={`${styles.dot} ${styles.dotYellow}`} />
          <div className={`${styles.dot} ${styles.dotGreen}`} />
        </div>
        <div className={styles.browserUrl}>portfolioforge.dev/kim-jaemin</div>
      </div>

      {/* Mock portfolio content */}
      <div className={styles.portfolioContent}>
        <div className={styles.profileProjectRow}>
          {/* 프로필 영역 */}
          <div className={styles.profileArea}>
            <div className={styles.avatar} />
            <div className={styles.userName}>김재민</div>
            <div className={styles.userRole}>Frontend Engineer · Seoul</div>
            <div className={styles.tagContainer}>
              {["React", "TypeScript", "Next.js", "Tailwind"].map((t) => (
                <span key={t} className={styles.tag}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* 프로젝트 그리드 (2열) */}
          <div className={styles.projectsGrid}>
            {[
              { name: "AI Portfolio Builder", star: "128", lang: "#3182F6" },
              { name: "Design System Kit", star: "89", lang: "#8B5CF6" },
              { name: "Real-time Dashboard", star: "64", lang: "#10B981" },
              { name: "Open Graph Studio", star: "47", lang: "#F59E0B" },
            ].map((p) => (
              <div key={p.name} className={styles.projectCard}>
                <div className={styles.projectName}>{p.name}</div>
                <div className={styles.projectMeta}>
                  <div
                    className={styles.langDot}
                    style={{ backgroundColor: p.lang }}
                  />
                  <span className={styles.starText}>⭐ {p.star}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 기여도 그래프 */}
        <div className={styles.graphSection}>
          <div className={styles.graphLabel}>최근 1년 기여도</div>
          <div className={styles.graphGrid}>
            {contributionClasses.map((cls, i) => (
              <div key={i} className={`${styles.graphCell} ${cls}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
