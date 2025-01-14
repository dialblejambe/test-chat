import { mapKeys, mapValues } from 'lodash-es';

import { Locale } from './utils/locale';


const translationFiles = import.meta.glob('./headers/*.ts',{ eager: true })

const translations: Record<string, Locale> = mapValues(
  mapKeys(translationFiles, (_value, key) =>
    key.replace(/^\.\/headers\/(.*)\.ts$/, '$1')
  ),
  (module) => module.default
);

export default translations;
