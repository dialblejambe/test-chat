import { devtoolsExchange } from '@urql/devtools';
import React from 'react';
import { createClient, fetchExchange, Provider, ssrExchange } from 'urql';

import { apiHost } from 'app/constants/config';
import { useLocale } from 'app/contexts/IntlContext';
import { useSession } from 'app/contexts/SessionContext';
import authExchange from 'app/graphql/urql-exchanges/auth';
import cacheExchange from 'app/graphql/urql-exchanges/cache';
import buildAcceptLanguage from 'app/utils/buildAcceptLanguage';

export default function UrqlContext({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const session = useSession();
  const { locale } = useLocale();
  const isServerSide = typeof window === 'undefined';
  const ssrCache = ssrExchange({
    isClient: !isServerSide,
  });

  const fetchOptions = !isServerSide && {
    headers: { 'Accept-Language': buildAcceptLanguage(locale) },
  };

  const client = createClient({
    exchanges: [
      devtoolsExchange,
      cacheExchange(),
      authExchange(session),
      ssrCache,
      fetchExchange,
    ],
    url: `${apiHost}api/graphql`,
    fetchOptions,
  });

  return <Provider value={client}>{children}</Provider>;
}
