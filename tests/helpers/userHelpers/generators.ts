export const randomId = (): string =>
  Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)).join("");

export const randomEmail = (): string =>
  `qa_${Date.now()}_${Math.floor(Math.random() * 9999)}@example.com`;
