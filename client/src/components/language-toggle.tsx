import { Button } from "@/components/ui/button";
import { useTranslation, getCurrentLanguage } from "@/lib/i18n";

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center space-x-2"
      data-testid="button-language-toggle"
    >
      <i className="fas fa-globe text-gray-600"></i>
      <span className="text-sm font-medium text-gray-700">
        {language === 'en' ? 'EN/हिं' : 'हिं/EN'}
      </span>
    </Button>
  );
}
