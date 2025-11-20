"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [formData, setFormData] = useState({ childName: "", gender: "kız", toy: "", lesson: "" });
  const [result, setResult] = useState<{ story: string; imageUrl: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [pastStories, setPastStories] = useState<any[]>([]);
  
  // Baloncuklar için state
  const [bubbles, setBubbles] = useState<any[]>([]);

  // 1. Rastgele Baloncuklar
  useEffect(() => {
    const newBubbles = [...Array(5)].map((_, i) => ({
      id: i,
      size: 300 + i * 50,
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      duration: 20 + i * 5
    }));
    setBubbles(newBubbles);
  }, []);

  // 2. Oturum Kontrolü
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchPastStories();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchPastStories();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPastStories = async () => {
    const { data } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setPastStories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.story && data.imageUrl && session) {
        const { error } = await supabase.from('stories').insert([{
          child_name: formData.childName,
          story_text: data.story,
          image_url: data.imageUrl,
          user_id: session.user.id 
        }]);
        if (!error) fetchPastStories();
      }
      setResult(data);
    } catch (err) { alert("Hata oluştu"); } 
    finally { setLoading(false); }
  };

  // -- GİRİŞ EKRANI (LOGIN) --
  // Not: Giriş ekranı zaten koyu/renkli tasarıma sahip olduğu için buraya dark mode gerekmez.
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden relative">
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            className="absolute bg-white/10 rounded-full blur-3xl"
            initial={{ x: bubble.initialX, y: bubble.initialY, opacity: 0.3 }}
            animate={{ x: [0, 100, -100, 0], y: [0, -100, 100, 0] }}
            transition={{ duration: bubble.duration, repeat: Infinity, ease: "linear" }}
            style={{ width: bubble.size, height: bubble.size }}
          />
        ))}

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="bg-white/20 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/30 relative z-10"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-white drop-shadow-md">✨ Masal Atölyesi</h1>
            <p className="text-white/80 mt-2">Çocuğunuz için sonsuz hayaller kurun.</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-inner">
            <Auth 
              supabaseClient={supabase} 
              appearance={{ theme: ThemeSupa }} 
              providers={[]} 
              localization={{ variables: { sign_in: { email_label: 'E-posta', password_label: 'Şifre', button_label: 'Giriş Yap' }, sign_up: { email_label: 'E-posta', password_label: 'Şifre', button_label: 'Kayıt Ol' }}}}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // -- UYGULAMA EKRANI (DASHBOARD) --
  // Burada `dark:` sınıfları devreye giriyor
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 font-serif text-gray-800 dark:text-gray-100 transition-colors duration-500">
      
      {/* NAVBAR */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 p-4 px-8 flex justify-between items-center shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
        <h1 className="text-xl font-bold text-orange-600 dark:text-orange-400 flex items-center gap-2">
          ✨ <span className="hidden sm:inline">Masal Atölyesi</span>
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-300 hidden sm:inline">{session.user.email}</span>
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white px-4 py-2 rounded-full transition"
          >
            Çıkış Yap
          </button>
        </div>
      </nav>

      <main className="container mx-auto p-4 flex flex-col items-center pb-20 max-w-5xl">
        
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          
          {/* SOL: FORM */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl h-fit border border-orange-100 dark:border-gray-700 sticky top-24 transition-colors"
          >
            <h2 className="text-lg font-bold mb-4 text-orange-600 dark:text-orange-400 flex items-center gap-2">🎨 Yeni Masal Tasarla</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500">Kahraman</label>
                <input 
                  type="text" placeholder="Çocuğun Adı" required 
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-400 outline-none border border-transparent dark:border-gray-600 transition-colors" 
                  value={formData.childName} onChange={(e) => setFormData({ ...formData, childName: e.target.value })} 
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select 
                  className="p-3 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-lg outline-none border border-transparent dark:border-gray-600" 
                  value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="kız">Kız</option>
                  <option value="erkek">Erkek</option>
                </select>
                <input 
                  type="text" placeholder="Oyuncak" required 
                  className="p-3 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-lg outline-none border border-transparent dark:border-gray-600" 
                  value={formData.toy} onChange={(e) => setFormData({ ...formData, toy: e.target.value })} 
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500">Konu</label>
                <input 
                  type="text" placeholder="Örn: Paylaşmak" required 
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-400 outline-none border border-transparent dark:border-gray-600" 
                  value={formData.lesson} onChange={(e) => setFormData({ ...formData, lesson: e.target.value })} 
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:scale-[1.02] transition transform disabled:opacity-50">
                {loading ? "✨ Sihir Yapılıyor..." : "Masalı Oluştur"}
              </button>
            </form>
          </motion.div>

          {/* SAĞ: HİKAYE GÖSTERİMİ */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 relative transition-colors"
                >
                   <button onClick={() => window.print()} className="absolute top-4 right-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full text-sm font-bold hover:bg-green-200 dark:hover:bg-green-800 print:hidden">🖨️ Yazdır</button>
                   <button onClick={() => setResult(null)} className="absolute top-4 right-24 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm print:hidden">Kapat ✕</button>
                   
                   <div className="text-center">
                      <img src={result.imageUrl} className="w-2/3 mx-auto rounded-lg shadow-lg mb-6 rotate-1 hover:rotate-0 transition duration-500" />
                      <div className="prose prose-lg mx-auto text-left text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-medium">
                        {result.story}
                      </div>
                   </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400 dark:text-gray-500 border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl bg-white/50 dark:bg-gray-800/50"
                >
                  <span className="text-6xl mb-4">📚</span>
                  <p>Soldaki formu doldur ve sihir başlasın!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ALT: GALERİ */}
        <div className="w-full mt-16">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">📚 Kitaplığım</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {pastStories.map((story, i) => (
              <motion.div 
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => { setResult({ story: story.story_text, imageUrl: story.image_url }); window.scrollTo({top:0, behavior:'smooth'}); }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-100 dark:border-gray-700 hover:-translate-y-1"
              >
                <div className="h-40 overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                  <img src={story.image_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-2">
                    <span className="text-white text-xs font-bold">Tekrar Oku</span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 truncate">{story.child_name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{story.story_text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}