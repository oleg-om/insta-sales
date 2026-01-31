import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Languages } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ru' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2"
      title={t('language.select')}
    >
      <Languages className="h-4 w-4" />
      <span className="text-sm font-medium">
        {i18n.language === 'en' ? 'EN' : 'RU'}
      </span>
    </Button>
  );
};
