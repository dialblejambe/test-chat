// src/IntlContext.tsx
import { OnErrorFn } from '@formatjs/intl';
import { Locale as DateFnsLocale } from 'date-fns';
import preferredLocale from 'preferred-locale';
import React, { useContext, useReducer } from 'react';
import { IntlProvider } from 'react-intl';
import { useAsync } from 'react-use';

import translations from 'app/locales'; // Adjust the path as necessary

type LocaleState = {
  locale: string;
  setLocale: (locale: string) => void;
  unsetLocale: () => void;
};

function useLocaleState(initialLocale?: string): LocaleState {
  const availableLocales = Object.keys(translations);
  const [locale, setLocaleState] = React.useState(
    initialLocale || preferredLocale(availableLocales, 'en'),
  );
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  // Ensure we update the locale state if the user's language changes
  React.useEffect(() => {
    const handleLanguageChange = () => forceUpdate();
    window.addEventListener('languagechange', handleLanguageChange);
    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, []);

  const setLocale = (locale: string) => {
    setLocaleState(locale);
    document.cookie = `chosenLocale=${locale}; path=/`;
  };

  const unsetLocale = () => {
    setLocaleState(preferredLocale(availableLocales, 'en'));
    document.cookie = 'chosenLocale=; Max-Age=0; path=/';
  };

  return { locale, setLocale, unsetLocale };
}

export const LocaleContext = React.createContext<LocaleState>({
  locale: 'en',
  setLocale: () => null,
  unsetLocale: () => null,
});

// @ts-ignore We guarantee that this is actually never null
export const DateFnsLocaleContext = React.createContext<DateFnsLocale>(null);

const IntlContext: React.FC<{ locale?: string }> = ({
  children,
  locale: initialLocale,
}) => {
  const localeState = useLocaleState(initialLocale);

  const { value: localeData } = useAsync(async () => {
    const data = await translations[localeState.locale].load();
    return data;
  }, [localeState.locale]);

  const onError: OnErrorFn | undefined =
    process.env.NODE_ENV === 'development'
      ? (err) => {
          if (err.code === 'MISSING_TRANSLATION') return;
          throw err;
        }
      : undefined;

  return localeData ? (
    <LocaleContext.Provider value={localeState}>
      <DateFnsLocaleContext.Provider value={localeData.dateFns}>
        <IntlProvider
          onError={onError}
          locale={localeState.locale}
          messages={localeData.kitsu}
          key={localeState.locale}
          defaultRichTextElements={{
            b: (children) => <b>{children}</b>,
          }}>
          {children}
        </IntlProvider>
      </DateFnsLocaleContext.Provider>
    </LocaleContext.Provider>
  ) : null;
};

export default IntlContext;

export function useLocale(): LocaleState {
  return useContext(LocaleContext);
}

export function useDateFnsLocale(): DateFnsLocale {
  return useContext(DateFnsLocaleContext);
}
