// src/utils/parseISO.js

import { parseISO as parseDateISO } from "date-fns"; // date-fnsライブラリを使用する例

export const parseISO = (dateString) => {
  return parseDateISO(dateString);
};
