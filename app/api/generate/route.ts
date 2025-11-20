import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { childName, gender, toy, lesson } = body;

    // 1. HİKAYE ÜRETİMİ (Anahtarsız - Pollinations Text API)
    // URL üzerinden prompt gönderip cevabı text olarak alıyoruz.
    const storyPrompt = `Bana bir masal yaz. Kahraman: ${childName} adında bir ${gender}. Oyuncak: ${toy}. Ders: ${lesson}. Hikaye Türkçe olsun, uzun olsun ve masal başlığı ile başlasın.`;
    
    // URL içindeki boşlukları %20 formatına çeviriyoruz
    const encodedStoryPrompt = encodeURIComponent(storyPrompt);
    
    // Fetch isteği atıyoruzds
    const storyResponse = await fetch(`https://text.pollinations.ai/${encodedStoryPrompt}`);
    
    if (!storyResponse.ok) {
      throw new Error('Hikaye servisine ulaşılamadı.');
    }
    
    const storyText = await storyResponse.text();

    // 2. RESİM ÜRETİMİ (Anahtarsız - Pollinations Image API)
    // Resim için İngilizce basit bir prompt oluşturuyoruz (Manuel)
    const imagePrompt = `children book illustration, cute ${gender} named ${childName} playing with ${toy}, disney pixar style, 3d render, vibrant colors, magical`;
    const encodedImagePrompt = encodeURIComponent(imagePrompt);
    
    // Her seferinde farklı resim gelmesi için rastgele sayı (seed) ekliyoruz
    const randomSeed = Math.floor(Math.random() * 1000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedImagePrompt}?width=1024&height=1024&seed=${randomSeed}&nologo=true`;

    return NextResponse.json({ 
      story: storyText, 
      imageUrl: imageUrl 
    });

  } catch (error) {
    console.error("Hata:", error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}