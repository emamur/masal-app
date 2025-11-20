"use client";
import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    childName: "",
    gender: "kız",
    toy: "",
    lesson: "",
  });
  
  const [result, setResult] = useState<{ story: string; imageUrl: string } | null>(null);
  const [loading, setLoading] = useState(false);

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
      setResult(data);
    } catch (err) {
      alert("Bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  // Yazdırma (PDF Kaydetme) Fonksiyonu
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-amber-50 font-serif text-gray-800 print:bg-white">
      {/* Üst Başlık - Yazdırırken gizlenir */}
      <nav className="bg-orange-400 p-4 text-white text-center shadow-md print:hidden">
        <h1 className="text-2xl font-bold">✨ Sihirli Masal Atölyesi ✨</h1>
      </nav>

      <main className="container mx-auto p-4 flex flex-col items-center">
        
        {/* GİRİŞ FORMU - Hikaye oluşunca veya yazdırırken gizlenir */}
        {!result && (
          <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl mt-10 border-2 border-orange-100 print:hidden">
            <h2 className="text-xl font-semibold mb-6 text-orange-600 text-center">Masalını Tasarla</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Çocuğun Adı</label>
                <input
                  type="text" required
                  className="w-full p-3 border rounded-lg bg-orange-50 focus:ring-2 focus:ring-orange-400 outline-none"
                  value={formData.childName}
                  onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Cinsiyet</label>
                  <select
                    className="w-full p-3 border rounded-lg bg-orange-50"
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
                    placeholder="Örn: Dinozor"
                    className="w-full p-3 border rounded-lg bg-orange-50"
                    value={formData.toy}
                    onChange={(e) => setFormData({ ...formData, toy: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Öğretilecek Ders</label>
                <input
                  type="text" required
                  placeholder="Örn: Oyuncakları toplamak"
                  className="w-full p-3 border rounded-lg bg-orange-50"
                  value={formData.lesson}
                  onChange={(e) => setFormData({ ...formData, lesson: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition transform active:scale-95 disabled:opacity-50"
              >
                {loading ? "🪄 Masal Yazılıyor..." : "Masalı Oluştur"}
              </button>
            </form>
          </div>
        )}

        {/* HİKAYE KİTABI GÖRÜNÜMÜ */}
        {result && (
          <div className="w-full max-w-3xl mt-6 print:w-full print:max-w-none print:mt-0">
            
            {/* Butonlar - Yazdırırken gizlenir */}
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
                🖨️ PDF Olarak Kaydet / Yazdır
              </button>
            </div>

            {/* A4 Kağıdı Görünümlü Alan */}
            <div className="bg-white p-10 shadow-2xl rounded-sm border border-gray-200 min-h-[800px] relative print:shadow-none print:border-none print:p-0">
              {/* Süsleme Çizgisi */}
              <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-double border-orange-200 pointer-events-none print:border-gray-300"></div>

              <div className="relative z-10 text-center">
                {result.imageUrl && (
                  <img 
                    src={result.imageUrl} 
                    alt="Masal Resmi" 
                    className="w-3/4 mx-auto rounded-xl shadow-lg mb-8 border-4 border-white transform rotate-1 print:shadow-none print:border-0 print:rotate-0" 
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
      </main>
    </div>
  );
}