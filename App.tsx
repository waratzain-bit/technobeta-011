import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Link, 
  FileText, 
  Plus, 
  ThumbsUp, 
  Eye, 
  Search, 
  RefreshCw, 
  User, 
  Calendar, 
  ChevronRight, 
  BookOpen,
  Edit3,
  CheckSquare,
  Menu,
  TrendingUp,
  ArrowLeft,
  Settings
} from "lucide-react";

import { Post, SheetsConfig } from "./types";
import { 
  getPosts, 
  addPost, 
  likePost, 
  deletePost, 
  bulkUploadToSheet, 
  getLocalPosts,
  updatePost
} from "./lib/sheetsService";

import SpreadsheetConfig from "./components/SpreadsheetConfig";
import AIDraftModal from "./components/AIDraftModal";
import AddPostModal from "./components/AddPostModal";
import { AuthorProfileModal } from "./components/AuthorProfileModal";

// Dynamic Admin Workspaces
import SettingsWorkspace from "./components/SettingsWorkspace";
import CreatePostWorkspace from "./components/CreatePostWorkspace";
import ReviewPostWorkspace from "./components/ReviewPostWorkspace";
import EditPostWorkspace from "./components/EditPostWorkspace";

// AdSense standard requirements components
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import LegalPages from "./components/LegalPages";
import CookieConsent from "./components/CookieConsent";

const CATEGORIES = ["Semua", "Teknologi", "Desain", "Karya", "Opini"];

export default function App() {
  // Navigation State for AdSense guideline compliance
  const [currentNav, setCurrentNav] = useState<"home" | "about" | "contact" | "legal">("home");

  // Dynamic Website Custom Title
  const [websiteTitle, setWebsiteTitle] = useState<string>(() => {
    return localStorage.getItem("aurapost_website_title") || "Technobeta";
  });

  // Dynamic Google AdSense ID
  const [adsensePubId, setAdsensePubId] = useState<string>(() => {
    return localStorage.getItem("aurapost_adsense_pub_id") || "pub-0000000000000000";
  });

  // Sidebar dynamic tab controller
  const [sidebarTab, setSidebarTab] = useState<"feed" | "create" | "review" | "edit" | "settings">("feed");

  // Mobile Collapsible Sidebar toggler
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Active post being modified in Edit Workspace
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Master Posts State
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  // Google Sheets configurations
  const [sheetsConfig, setSheetsConfig] = useState<SheetsConfig>(() => {
    const savedUrl = localStorage.getItem("aurapost_sheets_url") || "";
    return {
      webAppUrl: savedUrl,
      isConnected: !!savedUrl,
      lastSyncedAt: localStorage.getItem("aurapost_last_synced") || undefined
    };
  });

  // Modal Dialog visibility triggers
  const [activeModal, setActiveModal] = useState<"none" | "config" | "add-manual" | "add-ai">("none");
  const [selectedReadPost, setSelectedReadPost] = useState<Post | null>(null);
  const [selectedAuthorProfile, setSelectedAuthorProfile] = useState<string | null>(null);
  
  // State untuk melacak gambar artikel yang sedang diperbesar (Lightbox)
  const [activezoomImage, setActiveZoomImage] = useState<string | null>(null);

  // User Role Management
  const [role, setRole] = useState<"visitor" | "admin">(() => {
    return (localStorage.getItem("aurapost_user_role") as "visitor" | "admin") || "visitor";
  });
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");

  const handleSetRole = (newRole: "visitor" | "admin") => {
    localStorage.setItem("aurapost_user_role", newRole);
    setRole(newRole);
    if (newRole === "visitor") {
      setSidebarTab("feed");
    }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPw = adminPasswordInput.trim().toLowerCase();
    if (cleanPw === "admin" || cleanPw === "redaksi" || cleanPw === "mading123") {
      handleSetRole("admin");
      setAdminPasswordInput("");
      setLoginError("");
      setShowAdminLogin(false);
    } else {
      setLoginError("Sandi Salah! Gunakan kata kunci mading seperti 'redaksi' or 'admin'.");
    }
  };

  // Handle setting website title dynamically
  const handleUpdateWebsiteTitle = (newTitle: string) => {
    localStorage.setItem("aurapost_website_title", newTitle);
    setWebsiteTitle(newTitle);
  };

  // Handle setting adsense publisher ID dynamically
  const handleUpdateAdsensePubId = (newId: string) => {
    localStorage.setItem("aurapost_adsense_pub_id", newId);
    setAdsensePubId(newId);
  };

  // Handle saving post changes
  const handleSaveEditPost = async (postId: string, updatedFields: Partial<Omit<Post, "id" | "createdAt" | "likes" | "views">>) => {
    try {
      const updated = await updatePost(postId, updatedFields, sheetsConfig.webAppUrl || undefined);
      if (updated) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
      }
    } catch (e) {
      console.error("Gagal memperbarui postingan:", e);
      throw e;
    }
  };

  // Reset local database data back to seed default
  const handleResetToDefault = () => {
    localStorage.removeItem("aurapost_local_posts");
    loadPostsData();
  };

  // Load Posts from Service (Auto uses Sheets URL if active)
  const loadPostsData = async (forceUrl = sheetsConfig.webAppUrl) => {
    setIsLoading(true);
    try {
      const data = await getPosts(forceUrl || undefined);
      setPosts(data);
    } catch (err) {
      console.error("Gagal memuat post:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPostsData();
  }, [sheetsConfig.webAppUrl]);

  // Deep-linking to automatically open specified post from URL parameters
  useEffect(() => {
    if (posts && posts.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const postParam = params.get("post") || params.get("article");
      const hashParam = window.location.hash.replace("#", "");
      const targetId = postParam || hashParam;
      
      if (targetId) {
        const matchingPost = posts.find((p) => p.id === targetId);
        if (matchingPost) {
          setSelectedReadPost(matchingPost);
        }
      }
    }
  }, [posts]);

  // Handle Sheet Connection Save
  const handleSaveSheetsUrl = (url: string) => {
    localStorage.setItem("aurapost_sheets_url", url);
    setSheetsConfig({
      webAppUrl: url,
      isConnected: !!url,
      lastSyncedAt: new Date().toLocaleTimeString("id-ID")
    });
    localStorage.setItem("aurapost_last_synced", new Date().toLocaleTimeString("id-ID"));
    setActiveModal("none");
  };

  // Disconnect Sheet
  const handleDisconnectSheet = () => {
    if (confirm("Koneksi Spreadsheet akan diputus. Aplikasi akan kembali membaca memori offline local. Lanjutkan?")) {
      localStorage.removeItem("aurapost_sheets_url");
      localStorage.removeItem("aurapost_last_synced");
      setSheetsConfig({
        webAppUrl: "",
        isConnected: false
      });
    }
  };

  // Handle Publishing new post
  const handlePublishPost = async (newPostData: Omit<Post, "id" | "createdAt" | "likes" | "views">) => {
    try {
      const added = await addPost(newPostData, sheetsConfig.webAppUrl || undefined);
      setPosts((prev) => [added, ...prev]);
    } catch (e) {
      console.error("Gagal mempublish post", e);
    }
  };

  // Handle post Liking action
  const handleLikeClick = async (postId: string) => {
    try {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
      );
      if (selectedReadPost && selectedReadPost.id === postId) {
        setSelectedReadPost(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }

      const freshLikes = await likePost(postId, sheetsConfig.webAppUrl || undefined);
      
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: freshLikes } : p))
      );
    } catch (err) {
      console.error("Gagal memberikan Like:", err);
    }
  };

  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId, sheetsConfig.webAppUrl || undefined);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setSelectedReadPost(null);
    } catch (err) {
      console.error("Gagal menghapus postingan:", err);
    }
  };

  // Force Bulk Sync of Local Offline Posts toward Google Sheet
  const handleBulkSyncToSheet = async () => {
    if (!sheetsConfig.webAppUrl) return;
    try {
      const localOfflines = getLocalPosts();
      if (localOfflines.length === 0) return;
      await bulkUploadToSheet(sheetsConfig.webAppUrl, localOfflines);
      loadPostsData();
    } catch (err) {
      console.error("Gagal melakukan sinkronisasi bulk", err);
      throw err;
    }
  };

  // Filter posts dynamically in client memory
  const filteredPosts = posts.filter((post) => {
    const matchesQuery = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = 
      selectedCategory === "Semua" || 
      post.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesQuery && matchesCategory;
  });

  // AdSense placement placeholder helper
  const AdSenseStub = ({ position }: { position: string }) => {
    const [isAdSenseLinked, setIsAdSenseLinked] = useState(false);
    const adInitialized = useRef(false);

    useEffect(() => {
      const hasAdSenseScript = !!(window as any).adsbygoogle || document.querySelector('script[src*="adsbygoogle.js"]');
      if (hasAdSenseScript) {
        setIsAdSenseLinked(true);
      }
    }, []);

    useEffect(() => {
      if (isAdSenseLinked && !adInitialized.current) {
        try {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          adInitialized.current = true;
        } catch (err) {
          console.error("AdSense token pushing error:", position, err);
        }
      }
    }, [isAdSenseLinked, position]);

    if (isAdSenseLinked) {
      return (
        <div className="w-full overflow-hidden my-4 flex justify-center bg-black/10 border border-neutral-900 rounded-xl py-2">
          <ins 
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minHeight: '90px' }}
            data-ad-client={`ca-${adsensePubId.startsWith("ca-") ? adsensePubId.replace("ca-", "") : adsensePubId}`}
            data-ad-slot={position === "HEADER_RESPONSIVE_IN_FEED" ? "1234567890" : "0987654321"}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      );
    }
    return null;
  };

  const renderSidebar = () => {
    const adminTabs = [
      { id: "feed", name: "Beranda Mading", icon: BookOpen },
      { id: "create", name: "+ Postingan Baru", icon: Plus },
      { id: "review", name: "Tinjau Postingan", icon: CheckSquare },
      { id: "edit", name: "Edit Postingan", icon: Edit3 },
      { id: "settings", name: "Setelan Platform", icon: Settings },
    ] as const;

    const visitorTabs = [
      { id: "feed", name: "Beranda Mading", icon: BookOpen }
    ] as const;

    const tabs = role === "admin" ? adminTabs : visitorTabs;

    return (
      <div className="flex flex-col gap-6 h-full text-neutral-300">
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850/60 flex flex-col gap-2 relative overflow-hidden shrink-0 select-text">
          <div className="absolute top-1.5 right-2 px-1 rounded bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[7.2px] font-mono uppercase text-emerald-400 font-extrabold tracking-wider">
              {role === "admin" ? "Mode Redaksi" : "Mode Pembaca"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${role === "admin" ? "bg-emerald-450 animate-pulse" : "bg-neutral-600"}`} />
            <span className="text-[9px] font-mono uppercase font-bold tracking-widest text-[#ff9f1c]">
              {role === "admin" ? "Editorial Desk" : "Ruang Pengunjung"}
            </span>
          </div>
          <h1 className="hidden lg:block font-black text-lg uppercase tracking-tighter text-neutral-100 truncate">
            Technobeta
          </h1>
          <p className="text-[10px] text-neutral-500 leading-normal max-w-full">
            {role === "admin" 
              ? "Tulis baru, sunting, tinjau, dan awankan data mading Anda secara live."
              : "Baca tulisan terbaru, berikan apresiasi suka, komentar, scroll, dan klik iklan."}
          </p>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSidebarTab("feed");
                  setSelectedReadPost(null);
                  if (tab.id !== "feed") setSidebarTab(tab.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-xl text-[10.5px] font-bold font-mono uppercase tracking-wider flex items-center gap-3 transition-all border ${
                  sidebarTab === tab.id && !selectedReadPost
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-405 shadow-md scale-[1.01]"
                    : "bg-transparent border-transparent text-neutral-550 hover:text-neutral-300 hover:bg-neutral-900"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${sidebarTab === tab.id && !selectedReadPost ? "text-emerald-405" : "text-neutral-600"}`} />
                <span className="truncate">{tab.name}</span>
              </button>
            );
          })}
        </div>

        <div className="border-t border-neutral-900/60 pt-4 flex flex-col gap-2">
          {role === "admin" ? (
            <button
              type="button"
              onClick={() => handleSetRole("visitor")}
              className="w-full py-2.5 px-3 bg-neutral-955 hover:bg-neutral-900 border border-neutral-850 hover:border-neutral-800 text-neutral-400 hover:text-neutral-200 rounded-xl text-[9px] font-bold font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
            >
              <span>🔒 KELUAR AKSES REDAKSI</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAdminLogin(true)}
              className="w-full py-2.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-[9px] font-bold font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
            >
              <span>🔑 AKSES REDAKSI / ADMIN</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen w-full bg-[#0a0908] text-neutral-100 flex flex-col relative select-text font-sans overflow-x-hidden">
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-emerald-950/15 via-[#0a0908]/0 to-transparent pointer-events-none" />
      
      {/* HEADER BAR (FIXED TOP) */}
      <header className="w-full shrink-0 border-b border-neutral-900 bg-black/60 backdrop-blur-md fixed top-0 inset-x-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {currentNav === "home" && role === "admin" && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-1.5 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-neutral-100 transition-colors"
                title="Buka Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <div 
              onClick={() => {
                setCurrentNav("home");
                setSidebarTab("feed");
                setSelectedReadPost(null);
              }}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)] animate-pulse" />
              <span className="text-sm sm:text-md font-bold tracking-widest uppercase font-mono bg-gradient-to-r from-neutral-100 to-neutral-500 bg-clip-text text-transparent">
                {websiteTitle}
              </span>
            </div>
            <span className="text-[9px] text-neutral-550 tracking-wider font-mono uppercase bg-neutral-900 border border-neutral-850 px-2 py-0.5 rounded-md hidden xs:inline">
              AdSense OK
            </span>
          </div>

          <nav className="hidden sm:flex items-center gap-1.5">
            <button onClick={() => { setCurrentNav("home"); setSelectedReadPost(null); }} className={`px-3 py-1.5 rounded-xl text-[10.5px] font-mono font-bold uppercase tracking-wider transition-all border ${currentNav === "home" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "text-neutral-400 hover:text-white border-transparent"}`}>Beranda</button>
            <button onClick={() => setCurrentNav("about")} className={`px-3 py-1.5 rounded-xl text-[10.5px] font-mono font-bold uppercase tracking-wider transition-all border ${currentNav === "about" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "text-neutral-400 hover:text-white border-transparent"}`}>Tentang</button>
            <button onClick={() => setCurrentNav("contact")} className={`px-3 py-1.5 rounded-xl text-[10.5px] font-mono font-bold uppercase tracking-wider transition-all border ${currentNav === "contact" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "text-neutral-400 hover:text-white border-transparent"}`}>Kontak</button>
            <button onClick={() => setCurrentNav("legal")} className={`px-3 py-1.5 rounded-xl text-[10.5px] font-mono font-bold uppercase tracking-wider transition-all border ${currentNav === "legal" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "text-neutral-400 hover:text-white border-transparent"}`}>Kebijakan Legal</button>
          </nav>

          <div className="flex items-center gap-3">
            {role === "admin" && (
              sheetsConfig.isConnected ? (
                <div onClick={() => setActiveModal("config")} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs cursor-pointer select-none transition-all">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider hidden xs:inline">Sheet Link</span>
                </div>
              ) : (
                <div onClick={() => setActiveModal("config")} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff9f1c]/10 hover:bg-[#ff9f1c]/25 border border-[#ff9f1c]/20 text-[#ff9f1c] rounded-xl text-xs cursor-pointer select-none transition-all">
                  <Link className="h-3.5 w-3.5 animate-spin" />
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider">Mading Sheet</span>
                </div>
              )
            )}
          </div>
        </div>
      </header>

      {/* MOBILE NAV (FIXED TOP ADJUSTMENT) */}
      <div className="sm:hidden w-full bg-[#121110] border-b border-neutral-900 px-4 py-2.5 flex items-center justify-around gap-1 fixed top-16 inset-x-0 z-40">
        <button onClick={() => { setCurrentNav("home"); setSelectedReadPost(null); }} className={`flex-1 py-1.5 text-center text-[10.5px] font-mono uppercase font-bold rounded-lg ${currentNav === "home" ? "bg-emerald-500/10 text-emerald-400" : "text-neutral-500"}`}>Beranda</button>
        <button onClick={() => setCurrentNav("about")} className={`flex-1 py-1.5 text-center text-[10.5px] font-mono uppercase font-bold rounded-lg ${currentNav === "about" ? "bg-emerald-500/10 text-emerald-400" : "text-neutral-500"}`}>Tentang</button>
        <button onClick={() => setCurrentNav("contact")} className={`flex-1 py-1.5 text-center text-[10.5px] font-mono uppercase font-bold rounded-lg ${currentNav === "contact" ? "bg-emerald-500/10 text-emerald-400" : "text-neutral-500"}`}>Kontak</button>
        <button onClick={() => setCurrentNav("legal")} className={`flex-1 py-1.5 text-center text-[10.5px] font-mono uppercase font-bold rounded-lg ${currentNav === "legal" ? "bg-emerald-500/10 text-emerald-400" : "text-neutral-500"}`}>Legal</button>
      </div>

      {/* BODY WORKSPACE CONTAINER */}
      <section className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 pt-28 pb-6 md:pt-32 md:pb-10 flex flex-col gap-8 z-20">
        
        {/* HERO SECTION ULTRA RAMPING DENGAN DYNAMIC TECH BACKGROUND YANG LEBIH HIDUP */}
        {currentNav === "home" && (
          <div className="w-full bg-[#121110] border border-neutral-900 py-3.5 px-4 sm:px-6 select-text relative rounded-xl overflow-hidden shadow-sm group">
            
            {/* LAPISAN GAMBAR TEKNOLOGI DI LATAR BELAKANG */}
            <div className="absolute inset-y-0 right-0 w-full sm:w-2/3 md:w-1/2 pointer-events-none select-none overflow-hidden z-0">
              {/* Efek Gradasi Hitam Masking Transparan Sekeliling */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#121110] via-[#121110]/70 to-transparent z-10" />
              <img 
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80" 
                alt="Tech Background" 
                className="w-full h-full object-cover object-center opacity-45 group-hover:opacity-60 group-hover:scale-[1.03] transition-all duration-1000"
              />
            </div>

            <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/[0.03] rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div className="flex flex-col gap-1">
                <h2 className="text-sm sm:text-md font-black tracking-tight text-neutral-100">
                  {role === "admin" ? "Kreativitas Tanpa Batas, Terarsip Otomatis." : `Selamat Datang di ${websiteTitle}`}
                </h2>
                <p className="text-[10.5px] text-neutral-450 leading-normal max-w-xl sm:max-w-md md:max-w-xl">
                  {role === "admin" ? (
                    <>Tulis opini, desain, atau riset. Didukung otomatisasi <strong className="text-yellow-450 font-medium">Gemini AI</strong> & terarsip langsung ke Google Sheets pribadi.</>
                  ) : (
                    "Jelajahi gagasan kreatif, opini mendalam, inovasi desain, dan catatan riset teknologi mutakhir hasil tulisan kontributor independen kami."
                  )}
                </p>
              </div>

              {/* SISI KANAN: STATUS UTILITY RINGKAS SEBAGAI PENYEIMBANG LAYOUT */}
              <div className="hidden sm:flex items-center gap-2 text-[9px] font-mono text-neutral-500 bg-black/50 backdrop-blur-sm border border-neutral-850/60 px-2.5 py-1 rounded-lg shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="uppercase tracking-wider font-bold text-neutral-400">Live Stream Data</span>
              </div>
            </div>
          </div>
        )}

        {currentNav === "about" && <AboutUs />}
        {currentNav === "contact" && <ContactUs />}
        {currentNav === "legal" && <LegalPages />}

        {currentNav === "home" && (
          <div className="flex flex-col md:flex-row gap-8 items-start flex-1 w-full">
            
            {/* Desktop Left Admin Navigation Sidebar */}
            {role === "admin" && (
              <aside className="hidden md:block w-60 shrink-0 self-stretch border-r border-neutral-900/60 pr-6">
                <div className="sticky top-24">
                  {renderSidebar()}
                </div>
              </aside>
            )}

            {/* Mobile Sidebar drawers */}
            <AnimatePresence>
              {isSidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                  <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 220 }} className="relative w-72 bg-[#0c0b0a] border-r border-neutral-850 p-6 flex flex-col shadow-2xl h-full overflow-y-auto z-10">
                    <div className="flex justify-between items-center mb-6 shrink-0">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-[#ff9f1c] uppercase">Menu Redaksi</span>
                      <button onClick={() => setIsSidebarOpen(false)} className="py-1 px-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 text-[9px] font-mono font-bold uppercase">TUTUP</button>
                    </div>
                    <div className="flex-1">{renderSidebar()}</div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Main Content Workspace viewport */}
            <div className="flex-1 min-w-0 w-full">
              
              {sidebarTab === "feed" && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start w-full">
                  
                  {/* AREA KIRI: Dinamis Antara Grid Feed Utama atau Mode Baca Inline */}
                  <div className="lg:col-span-3 flex flex-col gap-8 w-full">
                    
                    <AdSenseStub position="HEADER_RESPONSIVE_IN_FEED" />

                    {selectedReadPost ? (
                      /* MODE BACA INLINE: SIDEBAR ARSIP TETAP DI KANAN SCREEN */
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#121110] border border-neutral-850 p-6 sm:p-8 rounded-3xl flex flex-col gap-6"
                      >
                        <button
                          onClick={() => setSelectedReadPost(null)}
                          className="self-start py-1.5 px-3 bg-neutral-955 hover:bg-neutral-900 border border-neutral-850 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 hover:text-neutral-100 flex items-center gap-2 transition-colors"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                          Kembali Ke Mading
                        </button>

                        {/* GAMBAR ARTIKEL DENGAN FITUR ZOOM LIGHTBOX */}
                        <div className="w-full aspect-[21/10] bg-neutral-950 rounded-2xl overflow-hidden relative border border-neutral-900 shadow-inner group/img">
                          <img 
                            src={selectedReadPost.imageUrl || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80"} 
                            alt={selectedReadPost.title}
                            onClick={() => setActiveZoomImage(selectedReadPost.imageUrl || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80")}
                            className="w-full h-full object-cover cursor-zoom-in group-hover/img:scale-[1.01] transition-transform duration-500"
                            title="Klik untuk memperbesar gambar"
                          />
                          {/* Indikator petunjuk kecil di pojok gambar */}
                          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md border border-neutral-800 px-2 py-1 rounded-lg text-[9px] font-mono text-neutral-400 pointer-events-none opacity-0 group-hover/img:opacity-100 transition-opacity">
                            🔍 Klik Gambar
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-500 border-b border-neutral-900 pb-4">
                          <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase text-[9px]">
                            {selectedReadPost.category}
                          </span>
                          <span>Oleh <strong className="text-neutral-300 hover:underline cursor-pointer" onClick={() => setSelectedAuthorProfile(selectedReadPost.author)}>{selectedReadPost.author}</strong></span>
                          <span>•</span>
                          <span>{selectedReadPost.createdAt}</span>
                        </div>

                        <div className="flex flex-col gap-2">
                          <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-100 tracking-tight leading-tight">
                            {selectedReadPost.title}
                          </h3>
                          {selectedReadPost.subtitle && (
                            <p className="text-sm text-neutral-400 leading-relaxed italic">
                              {selectedReadPost.subtitle}
                            </p>
                          )}
                        </div>

                        {/* ISI ARTIKEL */}
                        <div className="text-sm text-neutral-300 leading-relaxed font-sans whitespace-pre-wrap select-text border-t border-neutral-900 pt-4">
                          {selectedReadPost.content}
                        </div>

                        {/* KOTAK AJAKAN INTERAKSI & KOMENTAR */}
                        <div className="mt-4 p-5 rounded-2xl bg-neutral-950/65 border border-neutral-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none">
                          <div className="flex flex-col gap-1">
                            <h5 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">💬 Punya Gagasan Serupa?</h5>
                            <p className="text-[11px] text-neutral-400 leading-normal max-w-md">
                              Sampaikan opini, kritik, atau pertanyaan Anda mengenai artikel ini melalui kolom komentar eksternal atau hubungi meja redaksi kami.
                            </p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setCurrentNav("contact")}
                            className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl shrink-0 transition-all"
                          >
                            Kirim Komentar / Respons
                          </button>
                        </div>

                        {/* ARTIKEL SARAN / REKOMENDASI LAINNYA */}
                        <div className="border-t border-neutral-900 pt-6 flex flex-col gap-3.5">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-amber-400" />
                            <h4 className="text-xs font-mono font-black uppercase tracking-wider text-neutral-200">Saran Artikel Lainnya</h4>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {posts
                              .filter((p) => p.id !== selectedReadPost.id)
                              .sort(() => 0.5 - Math.random())
                              .slice(0, 2)
                              .map((suggestedPost) => (
                                <div
                                  key={`suggested-${suggestedPost.id}`}
                                  onClick={() => {
                                    setSelectedReadPost(suggestedPost);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                  className="bg-neutral-950/40 border border-neutral-900 hover:border-neutral-800 p-3.5 rounded-xl flex items-start gap-3 cursor-pointer group transition-all"
                                >
                                  <div className="w-16 h-16 bg-neutral-900 rounded-lg overflow-hidden shrink-0 border border-neutral-850">
                                    <img 
                                      src={suggestedPost.imageUrl || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80"} 
                                      alt={suggestedPost.title} 
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1 min-w-0">
                                    <span className="text-[8px] font-mono uppercase text-emerald-400 font-bold">{suggestedPost.category}</span>
                                    <h5 className="text-[11px] font-bold text-neutral-300 group-hover:text-emerald-400 line-clamp-2 leading-tight transition-colors">
                                      {suggestedPost.title}
                                    </h5>
                                  </div>
                                </div>
                              ))}
                            {posts.filter((p) => p.id !== selectedReadPost.id).length === 0 && (
                              <p className="text-[10px] font-mono text-neutral-650 italic">Belum ada artikel rekomendasi lainnya.</p>
                            )}
                          </div>
                        </div>

                        {/* SEKSI AKSI UTAMA (LIKE & VIEWS) */}
                        <div className="flex items-center justify-between border-t border-neutral-900 pt-5 mt-2">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleLikeClick(selectedReadPost.id)}
                              className="flex items-center gap-2 py-2 px-4 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 hover:border-neutral-750 text-neutral-400 hover:text-red-400 font-mono font-bold text-xs rounded-xl transition-all"
                            >
                              <ThumbsUp className="h-4 w-4 text-red-500" />
                              <span>{selectedReadPost.likes} Suka</span>
                            </button>
                            <span className="text-xs font-mono text-neutral-500 flex items-center gap-1">
                              <Eye className="h-4 w-4" /> {selectedReadPost.views} Tayangan
                            </span>
                          </div>

                          {role === "admin" && (
                            <button
                              onClick={() => {
                                if(confirm("Hapus permanen artikel ini dari database?")) {
                                  handleDeletePost(selectedReadPost.id);
                                }
                              }}
                              className="py-2 px-4 bg-red-950/20 hover:bg-red-900/30 border border-red-900/40 text-red-400 font-mono text-xs font-bold uppercase rounded-xl transition-colors"
                            >
                              Hapus Artikel
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      /* LIST DAFTAR FEED UTAMA */
                      <>
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-neutral-900 pb-4">
                            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                              {CATEGORIES.map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => setSelectedCategory(cat)}
                                  className={`px-3.5 py-1.5 text-[11px] rounded-xl hover:text-neutral-200 transition-all font-bold border shrink-0 ${
                                    selectedCategory === cat ? "bg-emerald-500/10 border-emerald-400/40 text-emerald-400" : "bg-transparent border-transparent text-neutral-550 hover:bg-neutral-900"
                                  }`}
                                >
                                  {cat === "Semua" ? "🔥 Semua" : cat}
                                </button>
                              ))}
                            </div>

                            {role === "admin" && (
                              <div className="flex items-center gap-2.5 font-mono">
                                <button onClick={() => setSidebarTab("create")} className="flex-1 py-1.5 px-3.5 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-1.5"><Plus className="h-3.5 w-3.5" /> Tulis Baru</button>
                                <button onClick={() => setSidebarTab("create")} className="flex-1 py-1.5 px-3.5 bg-gradient-to-r from-yellow-500 to-yellow-405 text-neutral-950 rounded-xl text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-neutral-950" /> Ide Gemini AI</button>
                              </div>
                            )}
                          </div>

                          <div className="flex w-full">
                            <div className="relative flex-1">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                              <input
                                type="text"
                                placeholder="Cari postingan mading berdasarkan judul, kategori, penulis, atau kata kunci..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-900 focus:border-neutral-850 p-3.5 pl-11 rounded-2xl text-[11px] text-neutral-200 outline-none placeholder-neutral-600"
                              />
                            </div>
                          </div>
                        </div>

                        {/* HERO TERPOPULER */}
                        {!searchQuery && selectedCategory === "Semua" && posts.length > 0 && (
                          <div className="flex flex-col gap-4 bg-neutral-950/20 border border-neutral-900 p-5 sm:p-6 rounded-2xl relative overflow-hidden">
                            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-amber-500" />
                                <div>
                                  <h4 className="text-sm font-bold text-neutral-100 tracking-tight">Postingan Terpopuler</h4>
                                  <p className="text-[10px] text-neutral-500">Karya dengan jumlah tayangan pembaca tertinggi</p>
                                </div>
                              </div>
                              <span className="font-mono text-[9px] uppercase font-bold text-amber-400 bg-amber-400/5 border border-amber-400/10 px-2 py-0.5 rounded">HOT READS</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {[...posts]
                                .sort((a, b) => (b.views || 0) - (a.views || 0))
                                .slice(0, 3)
                                .map((post, index) => {
                                  let rankStyle = index === 0 ? "bg-amber-500/15 text-amber-300 border-amber-500/20" : index === 1 ? "bg-neutral-400/10 text-neutral-300 border-neutral-400/25" : "bg-orange-500/10 text-orange-400 border-orange-500/25";
                                  return (
                                    <motion.div
                                      key={`popular-${post.id}`}
                                      onClick={() => setSelectedReadPost(post)}
                                      whileHover={{ y: -3 }}
                                      onClickCapture={() => {
                                        setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, views: p.views + 1 } : p)));
                                      }}
                                      className="bg-[#121110]/95 border border-neutral-850 hover:border-amber-500/30 p-3.5 rounded-xl flex flex-col justify-between overflow-hidden cursor-pointer group shadow-md"
                                    >
                                      <div className="flex flex-col gap-2.5">
                                        <div className="w-full aspect-[21/10] bg-neutral-950 rounded-lg overflow-hidden relative">
                                          <img src={post.imageUrl || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80"} alt={post.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                                          <span className={`absolute top-2 left-2 text-[8px] font-mono font-bold px-2 py-0.5 rounded border ${rankStyle}`}># {index + 1} Populer</span>
                                        </div>
                                        <h4 className="text-xs font-bold text-neutral-100 tracking-tight leading-snug group-hover:text-amber-400 line-clamp-2">{post.title}</h4>
                                      </div>
                                      <div className="flex items-center justify-between border-t border-neutral-850/60 mt-3 pt-2 text-[9px] font-mono text-neutral-500">
                                        <span><Eye className="h-3.5 w-3.5 text-amber-500 inline mr-1" />{post.views} Views</span>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                            </div>
                          </div>
                        )}

                        {/* MAIN GRID ARTIKEL */}
                        {isLoading ? (
                          <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
                            <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest animate-pulse">Menghubungkan memori tulisan...</p>
                          </div>
                        ) : filteredPosts.length === 0 ? (
                          <div className="border border-dashed border-neutral-850 p-16 rounded-2xl flex flex-col items-center justify-center text-center max-w-md mx-auto">
                            <FileText className="h-8 w-8 text-neutral-600 mb-3" />
                            <p className="font-semibold text-neutral-300 text-sm">Postingan Tidak Ditemukan</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {filteredPosts.map((post) => (
                              <motion.div
                                key={post.id}
                                onClick={() => setSelectedReadPost(post)}
                                layout
                                whileHover={{ y: -5 }}
                                onClickCapture={() => {
                                  setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, views: p.views + 1 } : p)));
                                }}
                                className="bg-[#121110] border border-neutral-850 hover:border-neutral-750 p-4 rounded-2xl flex flex-col justify-between overflow-hidden shadow-md cursor-pointer group"
                              >
                                <div className="w-full aspect-[16/10] bg-neutral-950 rounded-xl overflow-hidden mb-4 relative">
                                  <img src={post.imageUrl || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80"} alt={post.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                                  <span className="absolute top-3 left-3 text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded border bg-neutral-900 border-neutral-800 text-neutral-400">{post.category}</span>
                                </div>
                                <div className="flex-1 flex flex-col gap-1.5">
                                  <div className="flex items-center gap-1 text-[9px] font-mono text-neutral-500">
                                    <User className="h-3 w-3" />
                                    <span className="truncate max-w-[90px]">{post.author}</span>
                                    <span>•</span>
                                    <Calendar className="h-3 w-3" />
                                    <span>{post.createdAt}</span>
                                  </div>
                                  <h4 className="text-xs sm:text-sm font-bold text-neutral-100 tracking-tight group-hover:text-emerald-400 transition-colors line-clamp-2 mt-1">{post.title}</h4>
                                </div>
                                <div className="flex items-center justify-between border-t border-neutral-850 mt-4 pt-2.5 text-[9px] font-mono text-neutral-500">
                                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {post.views}</span>
                                  <div className="flex items-center gap-0.5 text-neutral-400 group-hover:text-emerald-400"><span className="text-[9px] uppercase font-bold">BACA</span><ChevronRight className="h-3.5 w-3.5" /></div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    <AdSenseStub position="FOOTER_RESPONSIVE" />
                  </div>

                  {/* AREA KANAN: SIDEBAR ARSIP ARTIKEL TETAP TAMPIL UTUH */}
                  <aside className="hidden lg:block lg:col-span-1 w-full sticky top-24">
                    <div className="bg-[#121110] border border-neutral-850 p-4 rounded-2xl flex flex-col gap-4 max-h-[80vh] overflow-hidden shadow-lg">
                      <div className="flex items-center gap-2 pb-2 border-b border-neutral-900 shrink-0">
                        <FileText className="h-4 w-4 text-emerald-400" />
                        <h4 className="text-[11px] font-mono font-black uppercase tracking-wider text-neutral-200">
                          Arsip Artikel ({posts.length})
                        </h4>
                      </div>

                      <div className="flex flex-col gap-2.5 overflow-y-auto pr-1 no-scrollbar flex-1">
                        {posts.length === 0 ? (
                          <p className="text-[10px] font-mono text-neutral-650 italic text-center py-4">Belum ada artikel.</p>
                        ) : (
                          posts.map((post) => (
                            <div
                              key={`sidebar-${post.id}`}
                              onClick={() => {
                                setSelectedReadPost(post);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              onClickCapture={() => {
                                setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, views: p.views + 1 } : p)));
                              }}
                              className={`p-3 border rounded-xl cursor-pointer transition-all duration-200 group flex flex-col gap-1 ${
                                selectedReadPost?.id === post.id
                                  ? "bg-emerald-500/5 border-emerald-500/30"
                                  : "bg-neutral-950/40 border-neutral-900 hover:border-emerald-500/20"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 shrink-0 text-[8px] font-mono">
                                <span className={selectedReadPost?.id === post.id ? "text-amber-400" : "text-emerald-400"}>{post.category}</span>
                                <span className="text-neutral-600">{post.createdAt}</span>
                              </div>
                              <h5 className={`text-[11px] font-bold line-clamp-2 leading-snug ${selectedReadPost?.id === post.id ? "text-emerald-400" : "text-neutral-300 group-hover:text-emerald-400"}`}>
                                {post.title}
                              </h5>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </aside>

                </div>
              )}

              {sidebarTab === "create" && <CreatePostWorkspace onPublish={handlePublishPost} onSuccess={() => { loadPostsData(); setSidebarTab("feed"); }} />}
              {sidebarTab === "review" && <ReviewPostWorkspace posts={posts} onSelectRead={(post) => setSelectedReadPost(post)} onDelete={handleDeletePost} />}
              {sidebarTab === "edit" && <EditPostWorkspace posts={posts} editingPost={editingPost} onSetEditingPost={setEditingPost} onSaveEdit={handleSaveEditPost} />}
              {sidebarTab === "settings" && <SettingsWorkspace websiteTitle={websiteTitle} onUpdateWebsiteTitle={handleUpdateWebsiteTitle} sheetsConfig={sheetsConfig} onSaveUrl={handleSaveSheetsUrl} onDisconnect={handleDisconnectSheet} onResetToDefault={handleResetToDefault} postsCount={posts.length} adsensePubId={adsensePubId} onUpdateAdsensePubId={handleUpdateAdsensePubId} />}

            </div>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="w-full shrink-0 border-t border-neutral-900 bg-neutral-950/80 py-10 mt-auto z-30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1.5">
            <span className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase">{websiteTitle} Newsroom</span>
            <p className="text-[10.5px] text-neutral-550 leading-relaxed max-w-sm">Platform publikasi independen terintegrasi database Google Sheets & AI Generator.</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 text-[10.5px] font-mono font-bold text-neutral-400">
            <button onClick={() => { setCurrentNav("home"); setSelectedReadPost(null); }} className="hover:text-emerald-400 transition-colors uppercase">Beranda</button>
            <span className="text-neutral-700">•</span>
            <button onClick={() => setCurrentNav("about")} className="hover:text-emerald-400 transition-colors uppercase">Tentang Kami</button>
            <span className="text-neutral-700">•</span>
            <button onClick={() => setCurrentNav("contact")} className="hover:text-emerald-400 transition-colors uppercase">Hubungi Kami</button>
            <span className="text-neutral-700">•</span>
            <button onClick={() => setCurrentNav("legal")} className="hover:text-emerald-400 transition-colors uppercase">Kebijakan Privasi</button>
            <span className="text-neutral-700">•</span>
            {role === "admin" ? (
              <button onClick={() => handleSetRole("visitor")} className="text-red-400 hover:text-red-300 uppercase flex items-center gap-1"><span>🔒 Keluar Redaksi</span></button>
            ) : (
              <button onClick={() => setShowAdminLogin(true)} className="text-emerald-500 hover:text-emerald-400 uppercase flex items-center gap-1"><span>🔑 Portal Redaksi</span></button>
            )}
          </div>
        </div>
      </footer>

      <CookieConsent />

      {/* MODAL CONTROLLER OVERLAYS */}
      <AnimatePresence>
        {activeModal === "config" && <SpreadsheetConfig webAppUrl={sheetsConfig.webAppUrl} onSaveUrl={handleSaveSheetsUrl} onClose={() => setActiveModal("none")} localPostsCount={posts.length} onSyncLocalData={handleBulkSyncToSheet} />}
        {activeModal === "add-manual" && <AddPostModal onPublish={handlePublishPost} onClose={() => setActiveModal("none")} />}
        {activeModal === "add-ai" && <AIDraftModal onPublish={handlePublishPost} onClose={() => setActiveModal("none")} />}
        {selectedAuthorProfile && <AuthorProfileModal authorName={selectedAuthorProfile} onClose={() => setSelectedAuthorProfile(null)} />}

        {/* MODAL LIGHTBOX: ZOOM GAMBAR ARTIKEL */}
        {activezoomImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 select-none">
            {/* Latar Belakang Gelap yang Bisa Diklik untuk Menutup */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setActiveZoomImage(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md cursor-zoom-out"
            />
            
            {/* Kontainer Gambar Utama */}
            <motion.div 
              initial={{ scale: 0.93, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.93, opacity: 0 }} 
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center z-10"
            >
              <img 
                src={activezoomImage} 
                alt="Zoomed Content" 
                className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-neutral-800 shadow-2xl bg-neutral-955"
                onClick={() => setActiveZoomImage(null)}
              />
              
              {/* Tombol Tutup di Atas Pojok Kanan */}
              <button 
                type="button"
                onClick={() => setActiveZoomImage(null)}
                className="absolute -top-12 right-0 sm:right-2 p-2 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-100 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider transition-all"
              >
                ✕ Tutup
              </button>
            </motion.div>
          </div>
        )}

        {showAdminLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => { setShowAdminLogin(false); setLoginError(""); setAdminPasswordInput(""); }} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-[#121110] border border-neutral-850 p-6 sm:p-8 rounded-3xl shadow-2xl z-10 flex flex-col gap-5 text-neutral-250 font-sans">
              <form onSubmit={handleAdminLoginSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-mono text-neutral-550 uppercase font-bold tracking-wider">Sandi Akses Kontrol</label>
                  <input type="password" placeholder="Masukkan sandi..." value={adminPasswordInput} onChange={(e) => setAdminPasswordInput(e.target.value)} required className="bg-neutral-950 border border-neutral-850 p-3.5 rounded-xl text-xs text-amber-400 outline-none font-mono" />
                  {loginError && <span className="text-[10px] text-red-400 font-mono italic mt-1 bg-red-950/20 px-2.5 py-1.5 rounded border border-red-900/40">{loginError}</span>}
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-neutral-850 pt-4">
                  <button type="button" onClick={() => { setShowAdminLogin(false); setLoginError(""); setAdminPasswordInput(""); }} className="px-4 py-2 text-xs font-mono font-bold text-neutral-500 uppercase">Batal</button>
                  <button type="submit" className="px-4.5 py-2.5 bg-emerald-500/10 hover:bg-emerald-550 text-emerald-400 hover:text-neutral-950 border border-emerald-500/20 font-bold font-mono text-[10.5px] uppercase rounded-xl transition-all">Masuk</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}