📚 SocialLibrary

SocialLibrary, kitap ve filmler için kullanıcıların puan verebildiği, yorum yapabildiği ve tüm aktivitelerin feed akışında listelendiği tam stack bir sosyal kütüphane uygulamasıdır.
Backend ASP.NET Core + PostgreSQL, frontend ise React (Vite + TypeScript) ile geliştirilmiştir.

*******FİLM KISMINDA VERİ ÇEKİLEMEMİŞTİR MOCK VERİ KULLANILMIŞTIR******

🚀 Özellikler
🔐 Kullanıcı Sistemi

JWT tabanlı kimlik doğrulama (Register / Login)

Identity ile kullanıcı yönetimi

Token saklama (localStorage) ve AuthContext

🔎 İçerik Arama

Google Books API ile kitap arama

TMDb API ile film arama

Başlık, kapak ve yıl bilgisiyle kart listesi

📄 Detay Sayfası

İçerik detaylarını (yıl, açıklama, tür, kapak/poster) gösterir

Kullanıcılar bu sayfadan puan verebilir ve yorum yazabilir

⭐ Puanlama Sistemi

1–10 arası rating

Ortalama puan ve oy sayısı anlık güncellenir

Her kullanıcı yalnızca 1 oy verebilir (update destekli)

💬 Yorum Sistemi

Token ile korunan yorum ekleme endpoint'i

Dinamik listeleme (sayfa yenilenmeden yeni yorum gösterilir)

📰 Feed (Aktivite Akışı)

Son yapılan puanlama ve yorumlar tek listede birleşir

“X Inception filmine 9/10 puan verdi” tarzı dinamik akış

İçerik başlıkları ve kullanıcı isimleri otomatik gösterilir

💅 Arayüz (UI)

Modern, sade mavi-beyaz tema

Kart tabanlı içerik düzeni

Sticky navbar

Responsive grid tasarımı

🧰 Kullanılan Teknolojiler
Backend

ASP.NET Core 8

Entity Framework Core + PostgreSQL

Identity + JWT Authentication

Swagger UI (API test)

HttpClient (Google Books)

Frontend

React (Vite + TypeScript)

Axios (API bağlantısı)

React Router

Context API (Auth yönetimi)

Inline CSS + Basit responsive düzen

⚙️ Kurulum
Backend
# Bağımlılıkları yükle
dotnet restore

# Veritabanı oluştur
dotnet ef database update

# Çalıştır
dotnet run


PostgreSQL connection string appsettings.json içinde ayarlanır:

"ConnectionStrings": {
  "Default": "Host=*;Port=*;Database=*;Username=*;Password=*"
}

Frontend
cd client
npm install
npm run dev



🧑‍💻 Geliştirici

Yiğit Usta
Bilgisayar Mühendisliği — Kocaeli Üniversitesi
