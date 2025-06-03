// helpers/formatCurrency.js

const currencyMap = {
  "id-ID": { symbol: "Rp", locale: "id-ID", label: "IDR - Indonesia (Rp)" },
  "en-US": { symbol: "$", locale: "en-US", label: "USD - United States ($)" },
  "en-GB": { symbol: "£", locale: "en-GB", label: "GBP - United Kingdom (£)" },
  "ja-JP": { symbol: "¥", locale: "ja-JP", label: "JPY - Japan (¥)" },
  "zh-CN": { symbol: "¥", locale: "zh-CN", label: "CNY - China (¥)" },
  "sg-SG": { symbol: "S$", locale: "sg-SG", label: "SGD - Singapore (S$)" },
  "de-DE": { symbol: "€", locale: "de-DE", label: "EUR - Germany (€)" },
};

const currency = [
  { label: "IDR - Indonesia (Rp)", value: "id-ID" },
  { label: "USD - United States ($)", value: "en-US" },
  { label: "GBP - United Kingdom (£)", value: "en-GB" },
  { label: "JPY - Japan (¥)", value: "ja-JP" },
  { label: "CNY - China (¥)", value: "zh-CN" },
  { label: "SGD - Singapore (S$)", value: "sg-SG" },
  { label: "EUR - Germany (€)", value: "de-DE" },
];

function formatCurrency(value, locale) {
  const config = currencyMap[locale] || currencyMap["id-ID"];
  return `${config.symbol}${value.toLocaleString(config.locale)}`;
}

function getLabel(params) {
  const config = currencyMap[params] || currencyMap["id-ID"];
  return config.label.split("-")[0].trim();
}

module.exports = { formatCurrency, getLabel, currency };
