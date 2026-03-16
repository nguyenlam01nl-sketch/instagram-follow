/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cf.shopee.vn" },
      { protocol: "https", hostname: "img.lazcdn.com" },
      { protocol: "https", hostname: "lzd-img-global.slatic.net" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

module.exports = nextConfig;