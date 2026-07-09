/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Tooltip } from 'recharts';
import Card from './components/Card';
import { NewsItem } from './types';
import { CURATED_NEWS_100 } from './data';
import { 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  Calendar, 
  Search, 
  Filter, 
  Volume2, 
  RefreshCw, 
  Bookmark, 
  FileText, 
  Check, 
  SlidersHorizontal,
  Download,
  Mail,
  BookOpen,
  MapPin,
  Sparkles,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  User,
  Users,
  Bell,
  Activity,
  Award,
  X,
  ArrowRight,
  Share2
} from 'lucide-react';

function getCategoryThumbnail(category: string, headline: string): string {
  const normCat = category.toLowerCase();
  
  // Use a simple hash code of the headline to select a sub-image for natural McKinsey/Bain style dynamic variety!
  let hash = 0;
  for (let i = 0; i < headline.length; i++) {
    hash = headline.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 3;

  const images: Record<string, string[]> = {
    regulation: [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&h=450&q=80", // corporate study
      "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&h=450&q=80", // abstract order pillars
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&h=450&q=80"  // elegant legal scale
    ],
    card: [
      "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=800&h=450&q=80", // premium card setup
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&h=450&q=80", // modern digital checkout
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&h=450&q=80"  // mobile banking preview
    ],
    upi: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&h=450&q=80", // strategy financial charts
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&h=450&q=80", // high end telemetry screens
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&h=450&q=80"  // precision financial indicators
    ],
    gateway: [
      "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&h=450&q=80", // programming workspace console
      "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&h=450&q=80", // modern blueprint flow
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&h=450&q=80"  // corporate database analytics
    ],
    ai: [
      "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=800&h=450&q=80", // abstract light paths
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&h=450&q=80", // high-contrast abstract layers
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&h=450&q=80"  // biometric vector node block
    ],
    crossborder: [
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&h=450&q=80", // digital earth connectivity
      "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=800&h=450&q=80", // business team worldwide operations
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&h=450&q=80"  // matrix and global tech networks
    ],
    default: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&h=450&q=80", // glass skyscraper building exterior
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&h=450&q=80", // corporate conference interior
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&h=450&q=80"  // elegant business consulting pose
    ]
  };

  let list = images.default;
  if (normCat.includes('regulation') || normCat.includes('compliance')) {
    list = images.regulation;
  } else if (normCat.includes('card') || normCat.includes('issuing')) {
    list = images.card;
  } else if (normCat.includes('upi') || normCat.includes('rails')) {
    list = images.upi;
  } else if (normCat.includes('gate') || normCat.includes('auth')) {
    list = images.gateway;
  } else if (normCat.includes('ai') || normCat.includes('fraud') || normCat.includes('prevention')) {
    list = images.ai;
  } else if (normCat.includes('cross') || normCat.includes('fx') || normCat.includes('border')) {
    list = images.crossborder;
  }

  return list[index];
}

function getYearMonthKey(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "June 2026";
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch (e) {
    return "June 2026";
  }
}

function getDayKey(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "June 28";
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  } catch (e) {
    return "June 28";
  }
}

export default function App() {
  const [news, setNews] = useState<NewsItem[]>(() => {
    const saved = localStorage.getItem('paymentsFeed');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as NewsItem[];
        // Filter out duplicate headlines to keep the feed pristine
        const unique = parsed.filter((item, index, self) => 
          self.findIndex(t => t.headline === item.headline) === index
        );
        if (unique.length < parsed.length) {
          localStorage.setItem('paymentsFeed', JSON.stringify(unique));
        }
        return unique;
      } catch (e) {
        return CURATED_NEWS_100;
      }
    }
    return CURATED_NEWS_100;
  });

  const [savedArticles, setSavedArticles] = useState<NewsItem[]>(() => {
    const saved = localStorage.getItem('savedArticles');
    return saved ? JSON.parse(saved) : [];
  });

  const [recentlyViewed, setRecentlyViewed] = useState<NewsItem[]>([]);
  
  // The actively selected article being read on the main screen
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(() => {
    return news.length > 0 ? news[0] : null;
  });

  const [activeTab, setActiveTab] = useState<'strategic' | 'technical'>('strategic');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>('relevance');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Newsletter Subscribers & User Logins tracking states
  const [stats, setStats] = useState<{ totalLogins: number; subscribers: string[]; loginHistory: { id: string; emailOrName: string; timestamp: string }[] }>({
    totalLogins: 14,
    subscribers: ["partner@bain.com", "vp-payments@visa.com", "fintech-lead@razorpay.com"],
    loginHistory: []
  });

  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem('csuiteCurrentUser') || 'partner@bain.com';
  });

  const [showSubscribePopup, setShowSubscribePopup] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmailOrName, setLoginEmailOrName] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);

  // A/B Testing & Diagnostics States
  const [abVariant, setAbVariant] = useState<'A' | 'B'>(() => {
    return (localStorage.getItem('csuiteAbVariant') as 'A' | 'B') || 'A';
  });
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticsCompleted, setDiagnosticsCompleted] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<{
    api: { status: 'pass' | 'fail' | 'idle'; message: string; latency?: number };
    speech: { status: 'pass' | 'fail' | 'idle'; message: string };
    pdf: { status: 'pass' | 'fail' | 'idle'; message: string };
    storage: { status: 'pass' | 'fail' | 'idle'; message: string };
    subscriberSync: { status: 'pass' | 'fail' | 'idle'; message: string };
  }>({
    api: { status: 'idle', message: 'Ready to test connectivity' },
    speech: { status: 'idle', message: 'Ready to test browser synthesis API' },
    pdf: { status: 'idle', message: 'Ready to verify PDF stream constructor' },
    storage: { status: 'idle', message: 'Ready to check localStorage engine' },
    subscriberSync: { status: 'idle', message: 'Ready to verify live subscriber database' }
  });

  // Archive accordion toggles
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>(() => {
    if (news.length > 0) {
      const topMonth = getYearMonthKey(news[0].createdAt);
      return { [topMonth]: true };
    }
    return { "June 2026": true };
  });

  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>(() => {
    if (news.length > 0) {
      const topDay = getDayKey(news[0].createdAt);
      return { [topDay]: true };
    }
    return {};
  });

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = windowHeight > 0 ? (totalScroll / windowHeight) * 100 : 0;
      setScrollProgress(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
  }, [savedArticles]);

  useEffect(() => {
    localStorage.setItem('paymentsFeed', JSON.stringify(news));
  }, [news]);

  const selectArticleHandler = (article: NewsItem) => {
    setSelectedArticle(article);
    // Track viewed list
    setRecentlyViewed(prev => {
      const filtered = prev.filter(a => a.headline !== article.headline);
      return [article, ...filtered].slice(0, 5);
    });
    // Scroll smoothly to top of active briefing area
    const briefingElement = document.getElementById("featured-briefing-stage");
    if (briefingElement) {
      briefingElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakBriefing = () => {
    if (!selectedArticle) return;

    if (isSpeaking) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    // Detect the time of the day to modify the greeting
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) {
      greeting = 'Good afternoon';
    } else if (hour >= 17) {
      greeting = 'Good evening';
    }

    // Mention the exact date and month of the feed
    const articleDateObj = new Date(selectedArticle.createdAt);
    const feedDateFormatted = isNaN(articleDateObj.getTime())
      ? "June 28"
      : articleDateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

    // Construct the trending-intelligence text focusing on the selected article
    const text = `${greeting}! Today's feed date is ${feedDateFormatted}, 2026. Welcome to your Daily Payments Pulse briefing. Today we are focusing heavily on ${selectedArticle.category} regarding ${selectedArticle.headline}. Here is Trisha's strategic perspective: ${selectedArticle.strategicView}. Looking at the corporate technical impact: ${selectedArticle.technicalView}. Actionable steps for business experts are to: ${selectedArticle.expertInsights}. That completes your C-Suite summary. Stay strategic and have an exceptional day!`;
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select English (India) female voice as top priority, then fallback gracefully to other professional female voices
    const voices = window.speechSynthesis.getVoices();
    let preferredVoice = voices.find(v => 
      (v.lang === 'en-IN' || v.lang.startsWith('en-IN')) && 
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('veena') || v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('google'))
    );
    
    if (!preferredVoice) {
      preferredVoice = voices.find(v => v.lang === 'en-IN' || v.lang.startsWith('en-IN'));
    }
    
    if (!preferredVoice) {
      preferredVoice = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.toLowerCase().includes('female') || v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Victoria') || v.name.includes('Karen') || v.name.includes('Moira') || v.name.includes('Tessa'))
      );
    }
    
    if (!preferredVoice) {
      preferredVoice = voices.find(v => v.lang.startsWith('en'));
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Configured for high-energy professional C-Suite delivery
    utterance.rate = 1.15; 
    utterance.pitch = 1.1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };
    
    // Cancel any previous speech synthesis to capture immediate focus
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/generate-news', { method: 'POST' });
      
      if (response.status === 429) {
        setErrorMessage("Rate limit exceeded. Please try again in about a minute.");
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.warn("Received non-JSON response:", text);
        throw new Error("Received invalid content format from the server.");
      }
      
      const data = await response.json();
      if (data.news && data.news.length > 0) {
        // We prepend new articles to the archive database
        // To prevent duplicate headlines, we filter out existing ones
        setNews(prev => {
          const uniqueNew = data.news.filter(
            (item: NewsItem) => !prev.some(existing => existing.headline === item.headline)
          );
          const updated = [...uniqueNew, ...prev];
          localStorage.setItem('paymentsFeed', JSON.stringify(updated));
          return updated;
        });

        // Instantly load the top generated article of today on the main stage!
        setSelectedArticle(data.news[0]);

        // Auto-expand the newly generated article month and day
        const topMonth = getYearMonthKey(data.news[0].createdAt);
        const topDay = getDayKey(data.news[0].createdAt);
        setExpandedMonths(prev => ({ ...prev, [topMonth]: true }));
        setExpandedDays(prev => ({ ...prev, [topDay]: true }));

      } else {
        setErrorMessage("Failed to fetch news.");
      }
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch tracking statistics from the backend
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data && data.totalLogins !== undefined) {
        setStats(data);
      }
    } catch (e) {
      console.error("Failed to fetch statistics", e);
    }
  }, []);

  // Post login tracking details to the backend
  const handleLoginOnStartup = useCallback(async (emailOrName: string) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrName })
      });
      const data = await res.json();
      if (data && data.success) {
        fetchStats();
      }
    } catch (e) {
      console.error("Failed to post login tracking", e);
    }
  }, [fetchStats]);

  // Handle subscriber submit
  const handleSubscribeSubmit = async (emailToSubscribe: string) => {
    if (!emailToSubscribe || !emailToSubscribe.includes('@')) return;
    setSubscribing(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToSubscribe })
      });
      const data = await res.json();
      if (data && data.success) {
        setSubscribeSuccess(true);
        localStorage.setItem('csuiteSubscribedOrDismissed', 'true');
        fetchStats();
        setTimeout(() => {
          setShowSubscribePopup(false);
          setSubscribeSuccess(false);
          setSubscribeEmail('');
        }, 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubscribing(false);
    }
  };

  // Switch profile handler
  const handleSwitchProfileSubmit = async (nameOrEmail: string) => {
    const cleaned = nameOrEmail.trim();
    if (!cleaned) return;
    setCurrentUser(cleaned);
    localStorage.setItem('csuiteCurrentUser', cleaned);
    await handleLoginOnStartup(cleaned);
    setShowLoginModal(false);
    setLoginEmailOrName('');
  };

  // Trigger login tracking once per session on mount or user switch
  useEffect(() => {
    const alreadyLogged = sessionStorage.getItem('csuiteLoggedThisSession');
    if (!alreadyLogged) {
      sessionStorage.setItem('csuiteLoggedThisSession', 'true');
      handleLoginOnStartup(currentUser);
    } else {
      fetchStats();
    }
  }, [currentUser, handleLoginOnStartup, fetchStats]);

  // Optional subscription pop-up timer trigger (displays after 2.5 seconds if not yet subscribed/dismissed)
  useEffect(() => {
    const hasDismissed = localStorage.getItem('csuiteSubscribedOrDismissed') === 'true';
    if (!hasDismissed) {
      const timer = setTimeout(() => {
        setShowSubscribePopup(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Daily auto-generator sync: checks if a C-Suite article has been compiled for today's date
  // (e.g. 2026-06-28), and triggers background generation if absent.
  useEffect(() => {
    const todayISO = new Date().toISOString().split('T')[0];
    const hasTodayArticle = news.some(item => {
      try {
        return item.createdAt.startsWith(todayISO);
      } catch (e) {
        return false;
      }
    });

    const alreadyCheckedToday = sessionStorage.getItem('csuiteAutoGeneratedCheck');

    if (!hasTodayArticle && !alreadyCheckedToday && !loading) {
      sessionStorage.setItem('csuiteAutoGeneratedCheck', 'true');
      console.log(`Auto-generating today's Payments Pulse C-Suite edition (${todayISO})...`);
      fetchNews();
    }
  }, [news, fetchNews, loading]);

  // Periodical sync in background (checks every 30 mins)
  useEffect(() => {
    const interval = setInterval(() => {
      const todayISO = new Date().toISOString().split('T')[0];
      const hasTodayArticle = news.some(item => {
        try {
          return item.createdAt.startsWith(todayISO);
        } catch (e) {
          return false;
        }
      });
      if (!hasTodayArticle) {
        fetchNews();
      }
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [news, fetchNews]);

  const runDiagnosticsSuite = async () => {
    setDiagnosticsRunning(true);
    setDiagnosticsCompleted(false);

    // 1. API Connectivity Test
    setDiagnosticResults(prev => ({
      ...prev,
      api: { status: 'idle', message: 'Pinging /api/stats endpoint...' }
    }));
    const startApi = Date.now();
    try {
      const res = await fetch('/api/stats');
      const latency = Date.now() - startApi;
      if (res.ok) {
        setDiagnosticResults(prev => ({
          ...prev,
          api: { status: 'pass', message: `Connected successfully. Code 200 OK.`, latency }
        }));
      } else {
        throw new Error(`Response returned code ${res.status}`);
      }
    } catch (e: any) {
      setDiagnosticResults(prev => ({
        ...prev,
        api: { status: 'fail', message: `API Connection Failed: ${e.message || e}` }
      }));
    }

    // Small delay to make it feel responsive and real
    await new Promise(resolve => setTimeout(resolve, 600));

    // 2. Speech Synthesis API Test
    setDiagnosticResults(prev => ({
      ...prev,
      speech: { status: 'idle', message: 'Initializing speechSynthesis context...' }
    }));
    try {
      if ('speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const voices = synth.getVoices();
        setDiagnosticResults(prev => ({
          ...prev,
          speech: { status: 'pass', message: `Speech API supported. Detected ${voices.length} system speech voices.` }
        }));
      } else {
        throw new Error('Speech synthesis API is not available in this browser context.');
      }
    } catch (e: any) {
      setDiagnosticResults(prev => ({
        ...prev,
        speech: { status: 'fail', message: `Speech Synthesis unavailable: ${e.message || e}` }
      }));
    }

    await new Promise(resolve => setTimeout(resolve, 600));

    // 3. PDF Strategy Exporter Test
    setDiagnosticResults(prev => ({
      ...prev,
      pdf: { status: 'idle', message: 'Testing jsPDF instance creation...' }
    }));
    try {
      const testDoc = new jsPDF();
      testDoc.text("Payments Pulse A/B Verification Test Suite", 10, 10);
      const output = testDoc.output('datauristring');
      if (output && output.startsWith('data:application/pdf')) {
        setDiagnosticResults(prev => ({
          ...prev,
          pdf: { status: 'pass', message: 'PDF document instantiated & successfully generated output stream.' }
        }));
      } else {
        throw new Error('PDF output stream is blank or invalid.');
      }
    } catch (e: any) {
      setDiagnosticResults(prev => ({
        ...prev,
        pdf: { status: 'fail', message: `PDF Generator crashed: ${e.message || e}` }
      }));
    }

    await new Promise(resolve => setTimeout(resolve, 600));

    // 4. Local Storage Persistence Test
    setDiagnosticResults(prev => ({
      ...prev,
      storage: { status: 'idle', message: 'Verifying client-side storage keys...' }
    }));
    try {
      const testKey = '__csuite_diag_test__';
      localStorage.setItem(testKey, 'PASSED_PERSISTENCE');
      const val = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      if (val === 'PASSED_PERSISTENCE') {
        setDiagnosticResults(prev => ({
          ...prev,
          storage: { status: 'pass', message: 'localStorage keys verified successfully (Read, Write & Evict).' }
        }));
      } else {
        throw new Error('Retrieved payload did not match written token.');
      }
    } catch (e: any) {
      setDiagnosticResults(prev => ({
        ...prev,
        storage: { status: 'fail', message: `Storage verification failed: ${e.message || e}` }
      }));
    }

    await new Promise(resolve => setTimeout(resolve, 600));

    // 5. Live Subscriber database check
    setDiagnosticResults(prev => ({
      ...prev,
      subscriberSync: { status: 'idle', message: 'Verifying subscriber list in server state...' }
    }));
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data && Array.isArray(data.subscribers)) {
        setDiagnosticResults(prev => ({
          ...prev,
          subscriberSync: { status: 'pass', message: `Subscribers synced. ${data.subscribers.length} C-Suite emails active.` }
        }));
      } else {
        throw new Error('Invalid stats schema returned from backend.');
      }
    } catch (e: any) {
      setDiagnosticResults(prev => ({
        ...prev,
        subscriberSync: { status: 'fail', message: `Subscriber verification failed: ${e.message || e}` }
      }));
    }

    setDiagnosticsRunning(false);
    setDiagnosticsCompleted(true);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Saved Research - Daily Payments Pulse", 15, 20);
    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 15, 27);
    
    let yOffset = 40;
    savedArticles.forEach((article, index) => {
      if (yOffset > 240) {
        doc.addPage();
        yOffset = 20;
      }
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`${index + 1}. [${article.category.toUpperCase()}] ${article.headline}`, 15, yOffset);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      const splitSummary = doc.splitTextToSize(`Summary: ${article.summary}`, 180);
      doc.text(splitSummary, 15, yOffset + 7);
      
      const splitInsights = doc.splitTextToSize(`Trisha's Perspective: ${article.strategicView}`, 180);
      doc.text(splitInsights, 15, yOffset + 7 + (splitSummary.length * 5) + 3);
      
      yOffset += 7 + (splitSummary.length * 5) + 3 + (splitInsights.length * 5) + 12;
    });
    
    // Add 'Confidential - C-Suite Intelligence' watermark to the footer of every page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Confidential - C-Suite Intelligence", 15, 287);
      doc.text(`Page ${i} of ${pageCount}`, 195, 287, { align: "right" });
    }
    
    doc.save("payments-pulse-saved-research.pdf");
  };

  const sendEmailSummary = () => {
    const subject = "Saved Payments Intelligence Summary";
    let body = "Here is your saved C-Suite payments intelligence from Daily Payments Pulse:\n\n";
    savedArticles.forEach((article, index) => {
      body += `=========================================\n`;
      body += `${index + 1}. [${article.category.toUpperCase()}] ${article.headline}\n`;
      body += `=========================================\n`;
      body += `Summary: ${article.summary}\n\n`;
      body += `Trisha's Perspective: ${article.strategicView}\n\n`;
      body += `Actionable Steps: ${article.expertInsights}\n\n`;
    });
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const saveArticle = (article: NewsItem) => {
    if (!savedArticles.some(a => a.headline === article.headline)) {
      setSavedArticles([...savedArticles, article]);
    }
  };

  const removeSavedArticle = (headline: string) => {
    setSavedArticles(prev => prev.filter(item => item.headline !== headline));
  };

  const handleShareArticle = (article: NewsItem) => {
    const appUrl = window.location.href.split('?')[0];
    const textToCopy = `💡 Payments Intelligence & Thought Leadership | Daily Payments Pulse

"${article.headline}"

BFSI Chief Strategist Trisha Sinha Roy's complete executive analysis, technical impact report, and actionable blueprints:
🔗 ${appUrl}

#PaymentsIntelligence #CSuiteThoughtLeadership #Fintech #BFSI`;

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      })
      .catch((err) => {
        console.error('Failed to copy share snippet:', err);
      });
  };

  // Grouped category counts for charting
  const categoryCounts = useMemo(() => {
    return (news || []).reduce((acc, article) => {
      acc[article.category] = (acc[article.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [news]);

  const chartData = useMemo(() => {
    return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  }, [categoryCounts]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981'];

  // Categories extracted dynamically for filters
  const categories = useMemo(() => {
    return ['All', ...new Set((news || []).map(n => n.category))];
  }, [news]);

  // Group all past generated articles in archive month and day wise
  const groupedArchive = useMemo(() => {
    const groups: Record<string, Record<string, NewsItem[]>> = {};
    
    // First apply search & category filter to search matches
    const processed = (news || []).filter(n => {
      const matchSearch = searchTerm.trim() === '' || 
        n.headline.toLowerCase().includes(searchTerm.toLowerCase()) || 
        n.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.strategicView.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = filterCategory === 'All' || n.category === filterCategory;
      return matchSearch && matchCat;
    });

    // Sort descending by date
    const sorted = [...processed].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    sorted.forEach(item => {
      const mKey = getYearMonthKey(item.createdAt);
      const dKey = getDayKey(item.createdAt);
      
      if (!groups[mKey]) {
        groups[mKey] = {};
      }
      if (!groups[mKey][dKey]) {
        groups[mKey][dKey] = [];
      }
      groups[mKey][dKey].push(item);
    });

    return groups;
  }, [news, searchTerm, filterCategory]);

  const toggleMonth = (mKey: string) => {
    setExpandedMonths(prev => ({ ...prev, [mKey]: !prev[mKey] }));
  };

  const toggleDay = (dKey: string) => {
    setExpandedDays(prev => ({ ...prev, [dKey]: !prev[dKey] }));
  };

  // If a search is actively going on, we show a clean search grid option
  const isSearchOrFilterActive = searchTerm.trim() !== '' || filterCategory !== 'All';

  // Get matching filtered news list for alternative search grid view
  const searchResults = useMemo(() => {
    return (news || []).filter(n => {
      const matchSearch = searchTerm.trim() === '' || 
        n.headline.toLowerCase().includes(searchTerm.toLowerCase()) || 
        n.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = filterCategory === 'All' || n.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [news, searchTerm, filterCategory]);

  // Handle setting default selected article if the current one gets filtered out or is null
  useEffect(() => {
    if (news.length > 0 && !selectedArticle) {
      setSelectedArticle(news[0]);
    }
  }, [news, selectedArticle]);

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1A1A1A] font-sans antialiased flex flex-col">
      {/* Scroll progress indicator */}
      <div 
        className="fixed top-0 left-0 h-1 bg-[#B8860B] z-50 transition-all duration-100" 
        style={{ width: `${scrollProgress}%` }} 
      />

      {/* Iconic Top Navigation Bar */}
      <nav className="w-full bg-[#1A1A1A] text-[#F8F7F4] flex flex-row items-center justify-between h-16 sticky top-0 z-40 border-b border-[#1A1A1A] shrink-0 shadow-md px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              const el = document.getElementById("featured-briefing-stage");
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-10 h-10 bg-[#B8860B] text-[#F8F7F4] flex items-center justify-center text-sm font-bold font-mono tracking-widest cursor-pointer hover:bg-[#B8860B]/80 transition border-none shrink-0"
            title="Daily Payments Pulse (P)"
          >
            P
          </button>
          <span className="font-mono text-[10px] tracking-widest uppercase font-bold text-[#F8F7F4]/60 hidden sm:inline">
            DAILY PAYMENTS INTELLIGENCE
          </span>
        </div>

        <div className="flex flex-row items-center gap-4">
          <button
            onClick={fetchNews}
            disabled={loading}
            className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-[#F8F7F4] border border-[#B8860B]/30 px-3 py-1.5 cursor-pointer text-[10px] font-mono uppercase tracking-wider transition font-semibold"
          >
            <RefreshCw size={11} className={`${loading ? 'animate-spin' : ''}`} />
            <span>Sync Today's Briefing</span>
          </button>

          <div className="flex items-center gap-2 bg-[#F8F7F4]/5 border border-[#F8F7F4]/10 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8860B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B8860B]"></span>
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#F8F7F4]/80 font-bold">
              LIVE PUBLICATION FEED
            </span>
          </div>
        </div>
      </nav>

      {/* Main Viewport Container */}
      <div className="flex-1 min-h-screen">
        
        {/* Main Editorial Feed & Research Binders (Single Column) */}
        <main className="max-w-4xl mx-auto p-5 sm:p-10 lg:p-12 flex flex-col gap-10">
          
          {/* Brand Header */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#1A1A1A]/10 pb-6 gap-4 text-left">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#1A1A1A]/60 mb-1">
                C-SUITE STRATEGY // TRISHA SINHA ROY
              </div>
              <h1 className="font-serif font-semibold text-3xl sm:text-[3rem] text-[#1A1A1A] tracking-tight leading-none">
                Daily Payments Pulse
              </h1>
              <div className="mt-2 text-xs text-[#1A1A1A]/50 font-medium">
                Author & Content Strategist: <span className="font-semibold text-[#1A1A1A]">Trisha Sinha Roy</span> (BFSI Chief Strategist)
              </div>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#B8860B] bg-[#B8860B]/5 px-4 py-2.5 font-bold border border-[#B8860B]/30 text-right self-start sm:self-auto">
              VERSION 3.5 // Q2 2026
            </span>
          </div>

          {loading && (
            <div className="bg-[#B8860B]/5 text-[#B8860B] p-4 border border-[#B8860B]/15 flex items-center justify-between text-xs font-mono tracking-wide animate-pulse">
              <div className="flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin" />
                <span>SYNCING DAILY INTELLIGENCE PIECES...</span>
              </div>
              <span className="bg-[#B8860B] text-[#F8F7F4] px-1.5 py-0.5 text-[9px] font-bold">ACTIVE</span>
            </div>
          )}

          {errorMessage && (
            <div className="bg-rose-50 text-rose-800 p-4 border border-rose-200 text-xs font-mono">
              ⚠️ SYSTEM ERROR: {errorMessage}
            </div>
          )}

          {/* Search/Filter notification */}
          {isSearchOrFilterActive && (
            <div className="bg-white border border-[#1A1A1A]/10 p-4 flex items-center justify-between">
              <div className="text-xs text-[#1A1A1A]/80 flex items-center gap-2">
                <SlidersHorizontal size={12} className="text-[#B8860B]" />
                <span>
                  Showing <strong>{searchResults.length}</strong> research briefs matching "<strong>{searchTerm || 'All'}</strong>" under <strong>{filterCategory}</strong>
                </span>
              </div>
              <button 
                onClick={() => { setSearchTerm(''); setFilterCategory('All'); }}
                className="text-[#B8860B] hover:underline text-[10px] font-bold font-mono uppercase cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Selected Briefing Stage */}
          <div id="featured-briefing-stage" className="scroll-mt-10">
            {selectedArticle ? (
              <article className="max-w-[800px] flex flex-col gap-6">
                
                {/* AI Voice Briefing Bot Controller */}
                <div className="bg-[#1A1A1A] text-[#F8F7F4] p-5 border border-[#B8860B]/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md rounded-xs text-left">
                  <div className="flex items-center gap-4 text-left w-full sm:w-auto">
                    <div className={`w-10 h-10 rounded-full bg-[#B8860B] flex items-center justify-center shrink-0 shadow-lg ${isSpeaking ? 'animate-pulse' : ''}`}>
                      <Volume2 size={20} className="text-[#F8F7F4]" />
                    </div>
                    <div>
                      <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#B8860B]">C-SUITE BROADCAST AUDIO BOT</div>
                      <div className="text-xs font-semibold font-serif italic text-white/90">"Trisha's Live Intelligence Feed"</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-[#F8F7F4]/10 pt-3 sm:pt-0">
                    {isSpeaking && (
                      <div className="flex items-end gap-1 px-3 h-5">
                        <span className="w-1 bg-[#B8860B] h-3 animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '0.6s' }}></span>
                        <span className="w-1 bg-[#B8860B] h-5 animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '0.5s' }}></span>
                        <span className="w-1 bg-[#B8860B] h-2 animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '0.7s' }}></span>
                        <span className="w-1 bg-[#B8860B] h-4 animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '0.4s' }}></span>
                      </div>
                    )}
                    <button
                      onClick={speakBriefing}
                      className={`px-5 py-2 text-[10px] font-mono font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                        isSpeaking 
                          ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                          : 'bg-[#B8860B] hover:bg-[#B8860B]/90 text-[#F8F7F4]'
                      }`}
                    >
                      {isSpeaking ? '⏹ STOP VOICE' : '▶ LISTEN BRIEFING'}
                    </button>
                  </div>
                </div>

                <span className="font-mono text-[10px] sm:text-xs text-[#B8860B] uppercase tracking-[0.12em] font-bold text-left">
                  {new Date(selectedArticle.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()} // {selectedArticle.category.toUpperCase()}
                </span>

                <h2 className="font-serif font-normal italic text-3xl sm:text-[3.5rem] leading-[1.0] sm:leading-[1.05] tracking-tight text-[#1A1A1A]">
                  {selectedArticle.headline.endsWith('.') ? selectedArticle.headline.slice(0, -1) : selectedArticle.headline}
                  <span className="text-[#B8860B]">.</span>
                </h2>

                {/* Editorial Angled Image */}
                <div className="relative w-full h-[240px] sm:h-[450px] overflow-hidden bg-[#1A1A1A] editorial-clip">
                  <img 
                    src={getCategoryThumbnail(selectedArticle.category, selectedArticle.headline)} 
                    alt={selectedArticle.headline}
                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-[1.02]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-[#1A1A1A]/15 mix-blend-multiply" />
                </div>

                {/* Lead Text */}
                <p className="text-lg sm:text-2xl font-light text-[#1A1A1A] leading-relaxed italic border-l-2 border-[#B8860B] pl-5 my-3">
                  "{selectedArticle.summary}"
                </p>

                {/* Strategic Perspective Box */}
                <div className="bg-white p-6 sm:p-10 border border-[#1A1A1A]/8 shadow-xs">
                  <div className="flex border-b border-[#1A1A1A]/10 pb-3 gap-6 mb-6">
                    <button
                      onClick={() => setActiveTab('strategic')}
                      className={`font-mono text-[10px] tracking-widest uppercase pb-1.5 transition border-b-2 font-bold cursor-pointer ${
                        activeTab === 'strategic' 
                          ? 'border-[#B8860B] text-[#B8860B]' 
                          : 'border-transparent text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
                      }`}
                    >
                      ⚡ DAILY NEWS FLASH
                    </button>
                    <button
                      onClick={() => setActiveTab('technical')}
                      className={`font-mono text-[10px] tracking-widest uppercase pb-1.5 transition border-b-2 font-bold cursor-pointer ${
                        activeTab === 'technical' 
                          ? 'border-[#B8860B] text-[#B8860B]' 
                          : 'border-transparent text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
                      }`}
                    >
                      🏢 COMPETITOR INTELLIGENCE
                    </button>
                  </div>

                  {activeTab === 'strategic' ? (
                    <div className="flex flex-col gap-5 text-left">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#1A1A1A] font-bold block mb-1">Payments, Fintech & Card Regulations (Indian BFSI)</span>
                        <p className="text-sm leading-relaxed text-[#1A1A1A]/80 font-serif text-[1.05rem]">
                          {selectedArticle.strategicView.startsWith("Trisha's 2 Cents:") || selectedArticle.strategicView.startsWith("Trisha's perspective:") ? selectedArticle.strategicView : `Trisha's 2 Cents: ${selectedArticle.strategicView}`}
                        </p>
                      </div>

                      <div className="border-t border-[#1A1A1A]/5 pt-4">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#B8860B] font-bold block mb-1">Executive Action Plan</span>
                        <p className="text-xs text-[#1A1A1A]/70 leading-relaxed font-sans">
                          {selectedArticle.expertInsights}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#1A1A1A] text-[#F8F7F4] p-6 rounded-xs font-mono text-xs flex flex-col gap-4 text-left">
                      <div>
                        <span className="text-[#B8860B] font-bold">// COMPETITOR INTELLIGENCE MATRIX:</span>
                        <p className="mt-2 text-slate-300 font-sans text-sm leading-relaxed whitespace-pre-wrap">
                          {selectedArticle.technicalView}
                        </p>
                      </div>
                      <div className="border-t border-[#F8F7F4]/10 pt-3">
                        <span className="text-slate-500">// SWITCHING SWITCHBOARD MATRIX:</span>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-[#B8860B]">
                          <div>issuers_health_cap: 98.4%</div>
                          <div>switching_api_retries: Active</div>
                          <div>crossborder_bin_status: Operational</div>
                          <div>compliance_code_mcc: Validated</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stakeholder Impact Grid - Styled differentially for A/B variant testing! */}
                <div className="border-t border-[#1A1A1A]/10 pt-6">
                  <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#1A1A1A]/50 mb-4 font-bold">
                    Stakeholder Risk/Reward Matrix
                  </h3>
                  
                  {abVariant === 'B' ? (
                    /* Bento Grid Style for Variant B */
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {(Object.entries(selectedArticle.stakeholderImpact) as [string, string][]).map(([role, status]) => {
                        const isUp = status.includes('▲');
                        const isDown = status.includes('▼');
                        return (
                          <div 
                            key={role} 
                            className={`p-4 border transition flex flex-col justify-between min-h-[100px] text-left ${
                              isUp ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900' :
                              isDown ? 'bg-rose-50/50 border-rose-100 text-rose-900' :
                              'bg-white border-[#1A1A1A]/10 text-[#1A1A1A]'
                            }`}
                          >
                            <span className="text-[9px] font-mono uppercase font-bold text-[#1A1A1A]/45">{role}</span>
                            <div className="font-bold text-xs mt-2 leading-snug">{status.replace(/[▲▼▬]/g, '').trim()}</div>
                            <span className="text-right text-xs font-black font-mono mt-2 block">
                              {isUp ? '▲' : isDown ? '▼' : '▬'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Elegant Row Style for Variant A */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(Object.entries(selectedArticle.stakeholderImpact) as [string, string][]).map(([role, status]) => {
                        const isUp = status.includes('▲');
                        const isDown = status.includes('▼');
                        return (
                          <div 
                            key={role} 
                            className={`border p-4 rounded-xs flex justify-between items-center text-left ${
                              isUp ? 'bg-emerald-50/50 border-emerald-100 text-emerald-950' :
                              isDown ? 'bg-rose-50/50 border-rose-100 text-rose-950' :
                              'bg-white border-[#1A1A1A]/10 text-[#1A1A1A]'
                            }`}
                          >
                            <div>
                              <div className="text-[9px] uppercase font-mono font-bold text-[#1A1A1A]/50">{role}</div>
                              <div className="text-xs font-bold mt-0.5">{status.replace(/[▲▼▬]/g, '').trim()}</div>
                            </div>
                            <span className="text-sm font-bold font-mono">
                              {isUp ? '▲' : isDown ? '▼' : '▬'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* CTA Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <button 
                    onClick={speakBriefing}
                    className="bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-white py-3.5 px-4 font-bold text-xs uppercase tracking-widest transition duration-200 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Volume2 size={14} />
                    <span>Listen Briefing</span>
                  </button>

                  <button 
                    onClick={() => handleShareArticle(selectedArticle)}
                    className={`py-3.5 px-4 font-bold text-xs uppercase tracking-widest transition duration-200 cursor-pointer border flex items-center justify-center gap-2 ${
                      shareSuccess
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-white hover:bg-[#1A1A1A]/5 border-[#1A1A1A]/20 text-[#1A1A1A]'
                    }`}
                  >
                    {shareSuccess ? <Check size={14} className="text-emerald-600 animate-bounce" /> : <Share2 size={14} />}
                    <span>{shareSuccess ? 'COPIED SNIP!' : 'SHARE INTEL'}</span>
                  </button>

                  <button 
                    onClick={() => saveArticle(selectedArticle)}
                    className={`py-3.5 px-4 font-bold text-xs uppercase tracking-widest transition duration-200 cursor-pointer border flex items-center justify-center gap-2 ${
                      savedArticles.some(a => a.headline === selectedArticle.headline)
                        ? 'bg-[#B8860B] text-white border-[#B8860B]'
                        : 'bg-white hover:bg-[#1A1A1A]/5 border-[#1A1A1A]/20 text-[#1A1A1A]'
                    }`}
                  >
                    <Bookmark size={14} className={savedArticles.some(a => a.headline === selectedArticle.headline) ? 'fill-current' : ''} />
                    <span>{savedArticles.some(a => a.headline === selectedArticle.headline) ? 'SAVED' : 'SAVE FOR LATER'}</span>
                  </button>
                </div>

                {/* Press Release Links */}
                {selectedArticle.sourceLink && (
                  <div className="border-t border-[#1A1A1A]/10 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px] text-[#1A1A1A]/50 text-left">
                    <span>Grounded on verified announcements via Google News</span>
                    <a
                      href={selectedArticle.sourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#B8860B] hover:underline font-bold"
                    >
                      View original on {selectedArticle.sourceName || 'Reserve Bank of India'} ↗
                    </a>
                  </div>
                )}
              </article>
            ) : (
              <div className="text-center py-16 text-[#1A1A1A]/40 font-serif italic text-lg bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 p-8">
                No active payments intelligence selected. Choose an article from the Intelligence Stream below to begin.
              </div>
            )}
          </div>

          {/* MIDDLE SECTION: THE PAYMENTS INTELLIGENCE STREAM (Unified Directory) */}
          <div className="mt-8 border-t border-[#1A1A1A]/10 pt-10 text-left">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-serif font-bold italic text-[#1A1A1A]">
                  C-Suite Intelligence Archive
                </h2>
                <p className="text-xs text-[#1A1A1A]/60 mt-1">Browse, search, and filter previous single-article daily briefings compiled by Trisha Sinha Roy</p>
              </div>

              {/* Category selector pills */}
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      filterCategory === cat
                        ? 'bg-[#B8860B] text-white font-bold'
                        : 'bg-white hover:bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 text-[#1A1A1A]/70'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Micro search and sort banner */}
            <div className="bg-white border border-[#1A1A1A]/10 p-4 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-2.5 text-[#1A1A1A]/40" />
                <input
                  type="text"
                  placeholder="Filter archived daily briefings by keyword or player..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#F8F7F4]/40 border-b border-[#1A1A1A]/15 text-xs text-[#1A1A1A] pl-9 pr-8 py-2 focus:bg-white focus:border-[#B8860B] outline-none transition"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-[#1A1A1A]/40 hover:text-[#1A1A1A] cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <span className="text-[10px] font-mono text-[#1A1A1A]/50 uppercase font-bold">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'relevance' | 'date')}
                  className="bg-white border border-[#1A1A1A]/10 text-xs py-1.5 px-3 font-mono text-[#1A1A1A] outline-none cursor-pointer"
                >
                  <option value="relevance">Relevance Index</option>
                  <option value="date">Publish Date</option>
                </select>
              </div>
            </div>

            {/* Intelligence Grid List */}
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.map((item, idx) => {
                  const isSelected = selectedArticle?.headline === item.headline;
                  return (
                    <div 
                      key={`${item.headline}-${idx}`} 
                      onClick={() => selectArticleHandler(item)}
                      className={`group border p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 rounded-xs text-left ${
                        isSelected 
                          ? 'bg-white border-[#B8860B] ring-1 ring-[#B8860B] shadow-sm' 
                          : 'bg-white hover:bg-[#F8F7F4]/40 border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-[#B8860B]">
                            {item.category}
                          </span>
                          <span className="font-mono text-[9px] text-[#1A1A1A]/40">
                            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                          </span>
                        </div>
                        
                        <h3 className={`text-base font-serif font-semibold leading-snug tracking-tight mb-2 group-hover:text-[#B8860B] transition-colors ${
                          isSelected ? 'text-[#B8860B]' : 'text-[#1A1A1A]'
                        }`}>
                          {item.headline.endsWith('.') ? item.headline.slice(0, -1) : item.headline}
                        </h3>
                        
                        <p className="text-xs text-[#1A1A1A]/60 italic line-clamp-3 mb-4 leading-relaxed">
                          "{item.summary}"
                        </p>
                      </div>

                      <div className="border-t border-[#1A1A1A]/5 pt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span className="text-[9px] font-mono text-[#1A1A1A]/50 uppercase">Verified Intel</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B8860B] flex items-center gap-0.5">
                          <span>Select briefing</span>
                          <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border border-[#1A1A1A]/10 bg-white">
                <span className="text-xs text-[#1A1A1A]/40 font-mono">No matching payments intelligence pieces found. Try refining search terms or category pills.</span>
              </div>
            )}
          </div>

          {/* BOTTOM SECTION: SAVED RESEARCH & REPORTS MANAGER */}
          {savedArticles.length > 0 && (
            <div className="mt-12 border-t border-[#1A1A1A]/15 pt-8 text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-serif font-bold italic text-[#1A1A1A] flex items-center gap-2">
                    <Bookmark size={20} className="text-[#B8860B]" />
                    <span>Saved Research Binder ({savedArticles.length})</span>
                  </h2>
                  <p className="text-xs text-[#1A1A1A]/60">Export saved intelligence summaries directly into C-Suite PDF briefings or email streams</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={sendEmailSummary} 
                    className="bg-white hover:bg-[#1A1A1A]/5 text-[#1A1A1A] px-4 py-2 text-xs font-bold uppercase transition border border-[#1A1A1A]/25 flex items-center gap-1.5 cursor-pointer font-mono"
                  >
                    <Mail size={13} />
                    <span>Draft Email Report</span>
                  </button>
                  <button 
                    onClick={exportPDF} 
                    className="bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-white px-4 py-2 text-xs font-bold uppercase transition flex items-center gap-1.5 cursor-pointer shadow-xs font-mono"
                  >
                    <Download size={13} />
                    <span>Export Saved to PDF</span>
                  </button>
                </div>
              </div>

              {/* Saved Binder Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedArticles.map((item, i) => (
                  <div key={`saved-${i}`} className="bg-white border border-[#1A1A1A]/10 p-5 rounded-xs hover:border-[#B8860B] transition shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-[9px] font-bold text-[#B8860B] uppercase tracking-wider">
                          {item.category}
                        </span>
                        <button 
                          onClick={() => removeSavedArticle(item.headline)}
                          className="text-[#1A1A1A]/40 hover:text-red-500 text-xs font-bold transition p-1 cursor-pointer"
                          title="Remove saved item"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <h3 className="text-[#1A1A1A] text-sm font-bold tracking-tight line-clamp-2 leading-tight mb-2">
                        {item.headline}
                      </h3>
                      <p className="text-[#1A1A1A]/70 text-[11px] italic line-clamp-3 mb-4 leading-relaxed">
                        "{item.summary}"
                      </p>
                    </div>

                    <div className="border-t border-[#1A1A1A]/5 pt-3 flex justify-between items-center">
                      <span className="text-[10px] text-[#1A1A1A]/40 font-mono">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <button 
                        onClick={() => selectArticleHandler(item)}
                        className="text-[#B8860B] hover:underline text-[10px] font-bold uppercase flex items-center gap-0.5 cursor-pointer font-mono"
                      >
                        <span>Read briefing</span>
                        <ArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Static informational credit from HTML design layout */}
          <div className="mt-16 pt-8 border-t border-[#1A1A1A]/10 text-center text-[11px] text-[#1A1A1A]/40 leading-relaxed max-w-xl mx-auto">
            Grounded on verified announcements via Google News and curated daily for C-Suite advisory. All reports are property of BFSI Advisory and published under executive oversight.
          </div>
        </main>
      </div>

      {/* Subscription Modal Popup (slide in/out style) */}
      {showSubscribePopup && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#1A1A1A] text-[#F8F7F4] border border-[#F8F7F4]/20 shadow-2xl p-5 flex flex-col gap-3 transition-all duration-300 transform translate-y-0 text-left">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5">
              <Bell size={14} className="text-[#B8860B] animate-bounce" />
              <span className="text-[9px] bg-[#B8860B]/20 text-[#B8860B] font-bold px-2 py-0.5 uppercase tracking-wider font-mono">
                Daily Newsletter
              </span>
            </div>
            <button 
              onClick={() => {
                setShowSubscribePopup(false);
                localStorage.setItem('csuiteSubscribedOrDismissed', 'true');
              }}
              className="text-white/40 hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div>
            <h4 className="text-sm font-serif italic text-white mb-1">
              Receive Daily C-Suite Digests
            </h4>
            <p className="text-[11px] text-white/60 leading-relaxed">
              Stay compiled on UPI switches, MPC mandate exclusions, PA-PG onboarding norms, and card networks interchange economics. Under 3-min daily read.
            </p>
          </div>

          {subscribeSuccess ? (
            <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-2 text-xs flex items-center gap-1.5">
              <Check size={14} className="text-emerald-400 shrink-0" />
              <span>Subscription confirmed!</span>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSubscribeSubmit(subscribeEmail); }} className="flex gap-1.5">
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                className="bg-white/5 border border-white/10 text-xs px-2.5 py-1.5 text-white placeholder-white/30 outline-none focus:border-[#B8860B] flex-1 min-w-0"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="bg-[#B8860B] hover:bg-[#B8860B]/90 text-white font-bold text-[10px] tracking-wider uppercase px-3 py-1.5 shrink-0 transition cursor-pointer"
              >
                {subscribing ? "..." : "SUBSCRIBE"}
              </button>
            </form>
          )}

          <div className="flex justify-between items-center text-[9px] text-white/40 border-t border-white/5 pt-2">
            <span>Join 4,200+ executive minds</span>
            <button 
              onClick={() => {
                setShowSubscribePopup(false);
                localStorage.setItem('csuiteSubscribedOrDismissed', 'true');
              }}
              className="hover:text-white/80 underline cursor-pointer"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* Switch Profile Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/60 backdrop-blur-xs text-left">
          <div className="bg-white border border-[#1A1A1A]/10 p-6 max-w-md w-full mx-4 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-3">
              <h3 className="font-serif italic font-bold text-[#1A1A1A] text-lg tracking-tight">
                Switch C-Suite User Profile
              </h3>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="text-[#1A1A1A]/40 hover:text-[#1A1A1A] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <p className="text-xs text-[#1A1A1A]/60 leading-relaxed">
                Log in as a different executive to simulate and track user engagement. Enter any name or email address to track customized login timestamps.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-mono font-bold text-[#1A1A1A]/40 uppercase tracking-widest">
                Profile Email / Name
              </label>
              <input
                type="text"
                placeholder="e.g. director-card-tech@mastercard.com"
                value={loginEmailOrName}
                onChange={(e) => setLoginEmailOrName(e.target.value)}
                className="bg-[#F8F7F4] border border-[#1A1A1A]/10 text-xs px-3 py-2 text-slate-900 outline-none focus:bg-white focus:border-[#B8860B]"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-[#1A1A1A]/5 pt-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="bg-[#F8F7F4] hover:bg-[#1A1A1A]/5 text-[#1A1A1A] font-bold text-[10px] tracking-wider uppercase px-4 py-2 cursor-pointer font-mono border border-[#1A1A1A]/10"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSwitchProfileSubmit(loginEmailOrName)}
                disabled={!loginEmailOrName.trim()}
                className="bg-[#1A1A1A] hover:bg-[#1A1A1A]/95 text-white font-bold text-[10px] tracking-wider uppercase px-4 py-2 disabled:opacity-55 transition cursor-pointer font-mono"
              >
                Switch & Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

