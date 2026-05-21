'use client';

import { useEffect, useState } from 'react';
import i18next from 'i18next';
import { initReactI18next, useTranslation as useTranslationOrg, UseTranslationOptions } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { getOptions, languages, cookieName } from './settings';

const runsOnServerSide = typeof window === 'undefined';

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(resourcesToBackend((language: string, namespace: string) => import(`../../public/locales/${language}/${namespace}.json`)))
  .init({
    ...getOptions(),
    lng: undefined, // 클라이언트 사이드에서 언어를 자동으로 감지하도록 설정
    detection: {
      order: ['path', 'htmlTag', 'cookie', 'navigator'],
    },
    preload: runsOnServerSide ? languages : [],
  });

/**
 * 클라이언트 사이드 전용 다국어 번역 Custom Hook
 */
export function useTranslation(lng: string, ns?: string, options?: UseTranslationOptions<undefined>) {
  const ret = useTranslationOrg(ns, options);
  const { i18n } = ret;

  // 1. 서버 사이드 렌더링 시점에 언어가 다른 경우 즉시 언어 동기화 수행
  if (runsOnServerSide && lng && i18n.resolvedLanguage !== lng) {
    i18n.changeLanguage(lng);
  }

  // 2. 클라이언트 사이드 활성 언어 상태 관리 (React Hook 규칙 준수를 위해 무조건 호출)
  const [, setActiveLng] = useState(i18n.resolvedLanguage);

  useEffect(() => {
    const handleLanguageChanged = (currentLng: string) => {
      setActiveLng(currentLng);
    };
    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  useEffect(() => {
    if (!lng || i18n.resolvedLanguage === lng) return;
    i18n.changeLanguage(lng);
  }, [lng, i18n]);

  useEffect(() => {
    if (!lng) return;
    document.cookie = `${cookieName}=${lng}; path=/`;
  }, [lng]);

  return ret;
}
