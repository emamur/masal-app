import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",       // PWA dosyaları public klasörüne gidecek
  register: true,       // Otomatik kayıt et
  skipWaiting: true,    // Güncelleme gelince hemen uygula
  disable: process.env.NODE_ENV === "development", // Geliştirme modunda PWA'yı kapat (kafamızı karıştırmasın)
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);