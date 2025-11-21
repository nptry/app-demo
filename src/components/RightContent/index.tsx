import { SelectLang as UmiSelectLang } from '@umijs/max';

export type SiderTheme = 'light' | 'dark';

const SUPPORTED_LANGS = ['zh-CN', 'en-US'];

const onlySupportedLocales = (locales: { lang?: string }[]) =>
  locales.filter((item) => item.lang && SUPPORTED_LANGS.includes(item.lang));

export const SelectLang: React.FC = () => {
  return (
    <UmiSelectLang
      postLocalesData={onlySupportedLocales}
      style={{
        padding: 4,
      }}
    />
  );
};
