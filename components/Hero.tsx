// components/Hero.tsx
export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center py-16 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 rounded-lg shadow-lg text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
        PlayTransfer
      </h1>
      <p className="text-lg md:text-2xl text-white max-w-2xl">
        Transfiere sin problemas tus playlists de Spotify a YouTube Music.
      </p>
    </section>
  );
}
