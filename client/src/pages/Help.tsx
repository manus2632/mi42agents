import { useTranslation } from "react-i18next";

export default function Help() {
  const { t } = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">{t("nav.help")}</h1>
    </div>
  );
}
