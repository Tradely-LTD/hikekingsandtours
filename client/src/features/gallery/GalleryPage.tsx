import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Play, X, Instagram, Youtube, ExternalLink, Camera, Film, Loader2, Image as ImageIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";

// Fallback placeholder photos shown when no media has been uploaded yet
const PLACEHOLDER_PHOTOS = [
  { id: -1, url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80", title: "Gurara Waterfall Adventure", category: "waterfall", type: "photo" as const },
  { id: -2, url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", title: "Sunrise Hike — Aso Rock", category: "sunrise", type: "photo" as const },
  { id: -3, url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80", title: "Green Heroes Trail", category: "general", type: "photo" as const },
  { id: -4, url: "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=800&q=80", title: "Night Glow Experience", category: "general", type: "photo" as const },
  { id: -5, url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", title: "Unity Hike — Abuja", category: "general", type: "photo" as const },
  { id: -6, url: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=80", title: "Waterfall Adventure", category: "waterfall", type: "photo" as const },
  { id: -7, url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80", title: "Sunrise Hike — Zuma Rock", category: "sunrise", type: "photo" as const },
  { id: -8, url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80", title: "Cultural Heritage Trail", category: "cultural", type: "photo" as const },
  { id: -9, url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80", title: "Green Heroes — Yankari", category: "general", type: "photo" as const },
  { id: -10, url: "https://images.unsplash.com/photo-1527489377706-5bf97e608852?w=800&q=80", title: "Corporate Team Hike", category: "team", type: "photo" as const },
  { id: -11, url: "https://images.unsplash.com/photo-1544198365-f5d60b6d8190?w=800&q=80", title: "Night Glow — Minna", category: "general", type: "photo" as const },
  { id: -12, url: "https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=800&q=80", title: "Unity Hike — Kaduna", category: "general", type: "photo" as const },
];

const SOCIAL_LINKS = [
  { platform: "instagram", label: "@hikekings_ng", url: "https://instagram.com/hikekings_ng", icon: Instagram, color: "from-purple-500 to-pink-500" },
  { platform: "youtube", label: "Hike Kings TV", url: "https://youtube.com/@hikekings", icon: Youtube, color: "from-red-600 to-red-400" },
  { platform: "tiktok", label: "@hikekings", url: "https://tiktok.com/@hikekings", icon: Film, color: "from-[oklch(0.08_0.01_240)] to-[oklch(0.18_0.02_240)]" },
];

const CATEGORIES = ["all", "general", "waterfall", "sunrise", "cultural", "camping", "team", "members"];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string>("");
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // Load media from database
  const { data: dbMedia, isLoading } = trpc.media.list.useQuery({ type: "all", limit: 200 });

  // Use DB media if available, otherwise fall back to placeholders
  const allPhotos = dbMedia && dbMedia.length > 0
    ? dbMedia.filter((m) => m.type === "photo")
    : PLACEHOLDER_PHOTOS;

  const allVideos = dbMedia && dbMedia.length > 0
    ? dbMedia.filter((m) => m.type === "video" || m.type === "reel")
    : [];

  const filteredPhotos = activeCategory === "all"
    ? allPhotos
    : allPhotos.filter((p) => p.category === activeCategory);

  const openLightbox = (url: string, title: string) => {
    setLightboxUrl(url);
    setLightboxTitle(title);
  };

  const closeLightbox = () => {
    setLightboxUrl(null);
    setLightboxTitle("");
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.72_0.18_75/0.08)] to-transparent pointer-events-none" />
        <div className="container text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[oklch(0.72_0.18_75/0.3)] bg-[oklch(0.72_0.18_75/0.08)] mb-6">
            <Camera className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span className="text-xs font-semibold tracking-widest text-[var(--gold)] uppercase">Media Gallery</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
            Every Hike, <span className="text-gradient">A Story</span>
          </h1>
          <p className="text-[oklch(0.62_0.02_240)] text-lg max-w-2xl mx-auto">
            Relive the adventures, discover the trails, and feel the spirit of Hike Kings through our growing collection of photos and videos.
          </p>
        </div>
      </section>

      {/* Social Links */}
      <section className="container mb-12">
        <div className="flex flex-wrap justify-center gap-4">
          {SOCIAL_LINKS.map((s) => (
            <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3 rounded-2xl glass border border-white/5 hover:border-[oklch(0.72_0.18_75/0.3)] transition-all group">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-[oklch(0.55_0.02_240)] capitalize">{s.platform}</p>
                <p className="text-sm font-semibold text-white group-hover:text-[var(--gold)] transition-colors">{s.label}</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[oklch(0.45_0.02_240)] group-hover:text-[var(--gold)] transition-colors" />
            </a>
          ))}
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="container mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold text-white">Photos</h2>
          {dbMedia && dbMedia.length === 0 && (
            <span className="text-xs text-[oklch(0.45_0.02_240)] italic">Showing sample photos — admin can upload real photos</span>
          )}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeCategory === cat
                  ? "bg-[var(--gold)] text-[oklch(0.08_0.01_240)]"
                  : "glass text-[oklch(0.62_0.02_240)] hover:text-white border border-white/5"
              }`}>
              {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl border border-white/5">
            <ImageIcon className="w-12 h-12 text-[oklch(0.45_0.02_240)] mx-auto mb-4" />
            <p className="text-[oklch(0.62_0.02_240)] font-semibold">No photos in this category yet</p>
            <p className="text-sm text-[oklch(0.45_0.02_240)] mt-1">Try selecting a different category</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {filteredPhotos.map((photo) => (
              <div key={photo.id}
                className="break-inside-avoid group relative rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-[oklch(0.72_0.18_75/0.3)] transition-all"
                onClick={() => openLightbox(photo.url, photo.title ?? "")}>
                <img
                  src={photo.url}
                  alt={photo.title ?? ""}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-xs font-semibold truncate">{photo.title}</p>
                    {photo.category && (
                      <span className="text-[0.65rem] text-[var(--gold)] uppercase tracking-wider">{photo.category}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Videos Section — only show if there are videos in DB */}
      {allVideos.length > 0 && (
        <section className="container mb-16">
          <h2 className="font-display text-2xl font-bold text-white mb-8">Videos & Reels</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allVideos.map((video) => (
              <div key={video.id} className="glass rounded-2xl overflow-hidden border border-white/5 hover:border-[oklch(0.72_0.18_75/0.3)] transition-all group">
                <div className="relative aspect-video bg-[oklch(0.12_0.015_240)] cursor-pointer"
                  onClick={() => setPlayingVideo(playingVideo === String(video.id) ? null : String(video.id))}>
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt={video.title ?? ""} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-12 h-12 text-[oklch(0.45_0.02_240)]" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[var(--gold)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-[oklch(0.08_0.01_240)] ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-white text-sm">{video.title ?? "Untitled"}</p>
                  {video.caption && <p className="text-xs text-[oklch(0.55_0.02_240)] mt-1 line-clamp-2">{video.caption}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[0.65rem] text-[var(--gold)] uppercase tracking-wider font-semibold">{video.type}</span>
                    <span className="text-[0.65rem] text-[oklch(0.45_0.02_240)]">{video.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty video state — encourage admin to upload */}
      {!isLoading && allVideos.length === 0 && (
        <section className="container mb-16">
          <h2 className="font-display text-2xl font-bold text-white mb-6">Videos & Reels</h2>
          <div className="text-center py-16 glass rounded-2xl border border-white/5">
            <Film className="w-12 h-12 text-[oklch(0.45_0.02_240)] mx-auto mb-4" />
            <p className="text-[oklch(0.62_0.02_240)] font-semibold">No videos uploaded yet</p>
            <p className="text-sm text-[oklch(0.45_0.02_240)] mt-1">Follow us on YouTube and Instagram for the latest adventure content</p>
            <div className="flex justify-center gap-3 mt-5">
              <a href="https://youtube.com/@hikekings" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-colors">
                <Youtube className="w-4 h-4" /> YouTube
              </a>
              <a href="https://instagram.com/hikekings_ng" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                <Instagram className="w-4 h-4" /> Instagram
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={closeLightbox}>
          <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 z-10" onClick={closeLightbox}>
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxUrl} alt={lightboxTitle} className="w-full max-h-[85vh] object-contain rounded-xl" />
            {lightboxTitle && (
              <p className="text-center text-white/70 text-sm mt-3">{lightboxTitle}</p>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
