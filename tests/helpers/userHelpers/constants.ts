export const BASE_URL = "/api/user";

export const ENDPOINTS = {
  LOGIN: `${BASE_URL}/login`,
  REGISTER: `${BASE_URL}/register`,
  VERIFY: `${BASE_URL}/verify`,
  DELETE: BASE_URL,
  PROFILE: `${BASE_URL}/profile`,
  PARTNER_REGISTER: "/api/partner/register",
} as const;

export const DEFAULT_USER = {
  idNumber: "11122233344",
  nameGe: "გიორგი",
  nameEn: "Giorgi",
  dateOfBirth: "1990-01-01",
  city: "tbilisi",
  address: "Rustaveli Ave 1",
  email: "giorgi.test@example.com",
  phone: "599123456",
  password: "StrongPassword123!",
} as const;

export const REAL_EMAILS = [
  "xoshtagio@gmail.com",
  "khoshtaria.g@gtu.ge",
  "giokhos059@gmail.com",
  "khoshtaria.gio@gmail.com",
  "xoshtariagiorgi80@gmail.com",
] as const;

export const DEFAULT_PARTNER = {
  companyNameGe: "კომპანია",
  companyNameEn: "Company",
  identificationCode: "123456789",
  contactPerson: "კონტაქტი",
  phone: "599123456",
  city: "tbilisi",
  email: "partner.test@example.com",
  address: "რუსთაველის გამზირი 1",
  addressEn: "Rustaveli Ave 1",
  description: "აღწერა",
  descriptionEn: "Description",
  website: "https://example.com",
  facebook: "https://facebook.com/example",
  instagram: "https://instagram.com/example",
  tiktok: "https://tiktok.com/@example",
  terms: true,
  category: "restaurant",
} as const;
