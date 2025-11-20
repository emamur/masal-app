"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [formData, setFormData] = useState({
    childName: "",
    gender: "kız",
    toy: "",
    lesson: "",
  });
  
  const [result, setResult] = useState<{ story: string; imageUrl: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [pastStories, setPastStories] = useState<any[]>([]); // Geçmiş masallar için depo

  // 1. Sayfa açılınca geçmiş masalları çek
  useEffect(() => {
    fetchPastStories();
  }, []);

  const fetchPastStories = async () => {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false }) // En yeniden eskiye
      .limit(6); // Son 6 tanesi

    if (data) {
      setPastStories(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // API'den hikayeyi üret
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      // Supabase'e Kaydet
      if (data.story && data.imageUrl) {
        const { error } = await supabase
          .from('stories')
          .insert([
            { 
              child_name: formData.childName, 
              story_text: data.story, 
              image_url: data.imageUrl 
            },
          ]);
          
        if (!error) {
            // Listeyi hemen güncelle
            fetchPastStories(); 
        }
      }

      setResult(data);
    } catch (err) {
      alert("Bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Galeriden bir masal seçince onu göster
  const loadStory = (story: any) => {
    setResult({ story: story.story_text, imageUrl: story.image_url });
    setFormData({ ...formData, childName: story.child_name }); // Formu da güncelle
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Yukarı kaydır
  };

  return (
    <div className="min-h-screen bg-amber-50 font-serif text-gray-800 print:bg-white">
      <nav className="bg-orange-400 p-4 text-white text-center shadow-md print:hidden">
        <h1 className="text-2xl font-bold">✨ Sihirli Masal Atölyesi ✨</h1>
      </nav>

      <main className="container mx-auto p-4 flex flex-col items-center pb-20">
        
        {/* GİRİŞ FORMU */}
        {!result && (
          <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl mt-10 border-2 border-orange-100 print:hidden">
            <h2 className="text-xl font-semibold mb-6 text-orange-600 text-center">Masalını Tasarla</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Çocuğun Adı</label>
                <input
                  type="text" required
                  className="w-full p-3 border rounded-lg bg-orange-50 outline-none text-black"
                  value={formData.childName}
                  onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Cinsiyet</label>
                  <select
                    className="w-full p-3 border rounded-lg bg-orange-50 text-black"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="kız">Kız</option>
                    <option value="erkek">Erkek</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Oyuncak</label>
                  <input
                    type="text" required
                    className="w-full p-3 border rounded-lg bg-orange-50 outline-none text-black"
                    value={formData.toy}
                    onChange={(e) => setFormData({ ...formData, toy: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Öğretilecek Ders</label>
                <input
                  type="text" required
                  className="w-full p-3 border rounded-lg bg-orange-50 outline-none text-black"
                  value={formData.lesson}
                  onChange={(e) => setFormData({ ...formData, lesson: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
              >
                {loading ? "🪄 Masal Yazılıyor..." : "Masalı Oluştur"}
              </button>
            </form>
          </div>
        )}

        {/* ANA HİKAYE ALANI */}
        {result && (
          <div className="w-full max-w-3xl mt-6 print:w-full print:max-w-none print:mt-0">
            <div className="flex justify-between mb-4 print:hidden">
              <button 
                onClick={() => setResult(null)}
                className="text-gray-500 hover:text-orange-500 underline"
              >
                ← Yeni Masal Yaz
              </button>
              <button 
                onClick={handlePrint}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 shadow-lg flex items-center gap-2"
              >
                🖨️ PDF Kaydet
              </button>
            </div>

            <div className="bg-white p-10 shadow-2xl rounded-sm border border-gray-200 min-h-[800px] relative print:shadow-none print:border-none print:p-0">
              <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-double border-orange-200 pointer-events-none print:border-gray-300"></div>
              <div className="relative z-10 text-center">
                {result.imageUrl && (
                  <img 
                    src={result.imageUrl} 
                    alt="Masal Resmi" 
                    className="w-3/4 mx-auto rounded-xl shadow-lg mb-8 border-4 border-white" 
                  />
                )}
                <div className="prose prose-lg mx-auto text-left font-medium text-gray-700 leading-relaxed whitespace-pre-wrap print:text-black">
                  {result.story}
                </div>
                <div className="mt-12 text-sm text-gray-400 italic print:text-gray-500">
                  ~ {formData.childName}'in Özel Masalı ~
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GEÇMİŞ MASALLAR GALERİSİ (YENİ EKLENEN KISIM) */}
        <div className="w-full max-w-5xl mt-20 print:hidden">
          <h3 className="text-2xl font-bold text-orange-800 mb-6 text-center">📚 Son Oluşturulan Masallar</h3>
          
          {pastStories.length === 0 ? (
            <p className="text-center text-gray-500">Henüz hiç masal oluşturulmamış. İlk sen ol!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {pastStories.map((story) => (
                <div 
                  key={story.id} 
                  onClick={() => loadStory(story)}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden border border-orange-100 group"
                >
                  <div className="h-48 overflow-hidden bg-gray-100">
                    <img 
                      src={story.image_url} 
                      alt={story.child_name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-lg text-gray-800">{story.child_name}'in Masalı</h4>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2 text-ellipsis">
                      {story.story_text}
                    </p>
                    <span className="text-orange-500 text-xs font-bold mt-3 block">Masalı Oku →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}