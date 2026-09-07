<div align="center">

# 🎙️ V14 Özel Oda

### Discord.js v14 ile geliştirilmiş, MongoDB destekli gelişmiş geçici ses odası sistemi

<p>
  <a href="https://github.com/WaseJS/v14-ozel-oda"><img src="https://img.shields.io/github/stars/WaseJS/v14-ozel-oda?style=for-the-badge&logo=github" alt="GitHub Stars"></a>
  <a href="https://github.com/WaseJS/v14-ozel-oda/network/members"><img src="https://img.shields.io/github/forks/WaseJS/v14-ozel-oda?style=for-the-badge&logo=github" alt="GitHub Forks"></a>
  <a href="https://github.com/WaseJS/v14-ozel-oda/blob/main/LICENSE"><img src="https://img.shields.io/github/license/WaseJS/v14-ozel-oda?style=for-the-badge" alt="License"></a>
  <a href="https://discord.js.org/"><img src="https://img.shields.io/badge/discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="discord.js"></a>
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
</p>

<p>
  <strong>Sunucunuzdaki kullanıcıların tek bir katılım kanalına girerek kendilerine özel geçici ses odaları oluşturmasını sağlar.</strong><br>
  Oda sahibi; isim, kullanıcı limiti, görünürlük, erişim ve kullanıcı yönetimini tek bir modern kontrol paneli üzerinden gerçekleştirebilir.
</p>

<p>
  <a href="https://github.com/WaseJS/v14-ozel-oda">Repository</a> ·
  <a href="https://github.com/WaseJS/v14-ozel-oda/issues">Issues</a> ·
  <a href="https://github.com/WaseJS/v14-ozel-oda/releases">Releases</a>
</p>

</div>

---

## ✨ Proje Hakkında

**V14 Özel Oda**, Discord sunucularında kullanıcıların ihtiyaç duyduklarında otomatik olarak kişisel geçici ses kanalları oluşturabilmesi için tasarlanmış bir Discord bot altyapısıdır.

Sistem, kullanıcının belirlenen **oluşturma/katılım ses kanalına** girmesini algılar. Kullanıcının MongoDB üzerinde kayıtlı tercihleri okunur ve otomatik olarak yeni bir ses kanalı oluşturulur. Kullanıcı doğrudan oluşturduğu odaya taşınır ve oda sahibi, kendisine sunulan kontrol paneli üzerinden odasını yönetebilir.

Oda boş kaldığında sistem gereksiz kanalları otomatik olarak temizler. Kullanıcının oda adı ve kullanıcı limiti gibi tercihleri ise MongoDB üzerinde saklanarak sonraki oda oluşturma işlemlerinde tekrar kullanılabilir.

> [!NOTE]
> Proje **discord.js v14** tabanlıdır ve `@discordjs/voice`, `mongoose`, `@napi-rs/canvas`, `undici` ve `global-agent` gibi paketlerden yararlanır.

---

## 🚀 Öne Çıkan Özellikler

| Özellik | Açıklama |
|---|---|
| 🎙️ **Otomatik Özel Oda** | Kullanıcı katılım kanalına girdiğinde otomatik ses odası oluşturulur. |
| 🧹 **Otomatik Temizlik** | Oda boş kaldığında 5 saniyelik kontrol sonrası otomatik silinir. |
| 👑 **Oda Sahipliği** | Oluşturulan oda kullanıcıya atanır ve yönetim yetkileri otomatik verilir. |
| ✏️ **Oda İsmi** | Oda sahibi kendi oda adını değiştirebilir. |
| 👥 **Kullanıcı Limiti** | Oda kapasitesi 0–99 arasında ayarlanabilir. `0` sınırsızdır. |
| 🔒 **Kilitle / Aç** | Odaya yeni kullanıcıların katılması kontrol edilebilir. |
| 👁️ **Gizle / Göster** | Odanın diğer üyeler tarafından görüntülenmesi yönetilebilir. |
| 🚫 **Kullanıcı Banı** | Belirli kullanıcıların odaya erişimi engellenebilir. |
| ✅ **Ban Kaldırma** | Daha önce engellenmiş kullanıcıların erişimi geri açılabilir. |
| 👢 **Odadan Atma** | Oda sahibi bir kullanıcıyı odadan çıkarabilir. |
| 📢 **Kullanıcı Çağırma** | Kullanıcıya DM üzerinden kendi odasına davet gönderebilir. |
| 🖼️ **Dinamik Panel Görseli** | Sunucu adı, sunucu ikonu ve oluşturma kanalı bilgileri panel görseline işlenir. |
| 🧩 **Components V2** | Discord'un modern Components V2 yapısı kullanılır. |
| 🗄️ **MongoDB Kalıcılığı** | Kullanıcının oda adı ve limit tercihi MongoDB'de saklanır. |
| 🎨 **Özel Emoji Desteği** | Panel ve bilgilendirme mesajlarında özel sunucu emojileri kullanılabilir. |
| 🛡️ **Yetkili Panel Komutu** | Kontrol panelinin kurulması yalnızca izin verilen kullanıcılarla sınırlandırılabilir. |
| 🔊 **Bot Ses Kanalı** | Bot başlangıçta belirlenen bir ses kanalına otomatik bağlanabilir. |

---

## 🎛️ Kontrol Paneli

Bot tarafından oluşturulan kontrol paneli, oda sahiplerinin kanalı hızlı şekilde yönetebilmesini sağlar.

### 📝 Oda İsmi

Odanın adını değiştirir ve yeni isim tercihini MongoDB'ye kaydeder. Böylece kullanıcı ileride tekrar oda oluşturduğunda kaydedilen isim tercihinden yararlanabilir.

### 👥 Oda Limiti

Odanın maksimum kullanıcı kapasitesini ayarlar.

- `0` → Sınırsız
- `1–99` → Belirlenen kullanıcı limiti
- Geçersiz değerler reddedilir

### 🔒 Kilitle / 🔓 Aç

- **Kilitle:** Genel sunucu üyelerinin odaya bağlanmasını engeller.
- **Aç:** Genel bağlantı iznini tekrar aktif eder.

### 👁️ Gizle / Göster

- **Gizle:** Genel üyelerin kanalı görüntülemesini engeller.
- **Göster:** Genel görünürlüğü tekrar aktif eder.

### 🚫 Banla / ✅ Ban Aç

Oda sahibi belirli bir kullanıcıya özel permission overwrite uygulayarak kullanıcının odayı görmesini ve bağlanmasını engelleyebilir. Ban kaldırıldığında ilgili kullanıcı overwrite'ı temizlenir.

### 📢 Çağır

Belirlenen kullanıcıya Discord DM'i göndererek kullanıcının odaya davet edilmesini sağlar.

### 👢 At

Oda sahibinin odadaki belirli bir kullanıcıyı ses kanalından çıkarmasına olanak sağlar.

---

## ⚙️ Çalışma Mantığı

```text
                    ┌─────────────────────┐
                    │  Kullanıcı Katılır   │
                    │  Oluşturma Kanalı    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  MongoDB'den Tercih │
                    │  ve Limit Bilgileri │
                    │      Alınır         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Geçici Ses Kanalı   │
                    │      Oluşturulur    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Kullanıcı Odaya     │
                    │ Otomatik Taşınır    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Kontrol Paneli    │
                    │ Oda Yönetimi        │
                    └──────────┬──────────┘
                               │
                  Kullanıcılar Ayrılır
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Oda 5 Sn. Boyunca   │
                    │     Boş mu?         │
                    └──────────┬──────────┘
                               │
                         Evet ─┴─ Hayır
                          │          │
                          ▼          └──► Oda Korunur
                   ┌──────────────┐
                   │ Oda Silinir  │
                   └──────────────┘
```

---

## 🧱 Proje Yapısı

```text
v14-ozel-oda/
│
├── models/
│   └── User.js             # MongoDB kullanıcı modeli
│
├── utils/
│   ├── panel.js             # Kontrol paneli ve Components V2 yapısı
│   └── generatePanel.js     # Dinamik panel görseli üretimi
│
├── config.js                # Ek konfigürasyon alanı
├── wase.js                  # Ana bot dosyası ve olay yönetimi
├── wase.json                # Bot / Discord / MongoDB ayarları
├── package.json             # Proje bağımlılıkları ve çalıştırma komutu
├── LICENSE                  # Lisans
└── README.md                # Dokümantasyon
```

---

## 🛠️ Gereksinimler

Projeyi çalıştırmadan önce aşağıdaki bileşenlerin sisteminizde bulunması gerekir:

- **Node.js 18 veya üzeri**
- **npm**
- **MongoDB** veya MongoDB Atlas
- Discord Bot hesabı
- Botun yönetilecek sunucuda gerekli izinlere sahip olması

Önerilen ortam:

```text
Node.js 20+
npm 10+
MongoDB 7+
discord.js 14.x
```

---

## 📦 Kurulum

### 1. Repository'yi klonlayın

```bash
git clone https://github.com/WaseJS/v14-ozel-oda.git
cd v14-ozel-oda
```

### 2. Bağımlılıkları yükleyin

```bash
npm install
```

### 3. `wase.json` dosyasını düzenleyin

Aşağıdaki alanları kendi Discord sunucunuza göre doldurun:

```json
{
  "token": "BOT_TOKENINIZ",
  "clientId": "BOT_CLIENT_ID",
  "joinChannelId": "OZEL_ODA_ICIN_SES_KANALI",
  "categoryId": "ODALARIN_KATEGORISI",
  "botVoiceChannelId": "BOTUN_GIRECEGI_SES_KANALI",
  "mongoUri": "MONGODB_CONNECTION_STRING",
  "prefix": ".",
  "allowedUsers": [
    "OWNER_ID"
  ]
}
```

> [!WARNING]
> `token` ve `mongoUri` gibi gizli bilgileri herkese açık repository'lerde paylaşmayın. Production ortamında environment variable kullanmanız önerilir.

---

## 🔧 Konfigürasyon Alanları

| Alan | Tür | Açıklama |
|---|---|---|
| `token` | `string` | Discord bot token'ı |
| `clientId` | `string` | Discord application / client ID |
| `joinChannelId` | `string` | Kullanıcıların girerek özel oda oluşturduğu ses kanalı |
| `categoryId` | `string` | Geçici odaların oluşturulacağı kategori |
| `botVoiceChannelId` | `string` | Botun hazır olduğunda katılacağı ses kanalı |
| `mongoUri` | `string` | MongoDB bağlantı adresi |
| `prefix` | `string` | Prefix tabanlı komutların başlangıç karakteri |
| `allowedUsers` | `string[]` | Kontrol panelini oluşturmasına izin verilen kullanıcı ID'leri |
| `emojis` | `object` | Panel ve mesajlarda kullanılacak özel emoji tanımları |

---

## 🎨 Özel Emoji Sistemi

`wase.json` içerisindeki `emojis` objesi, panelde kullanılan buton ve durum mesajlarının görsel olarak özelleştirilmesini sağlar.

Örnek:

```json
"emojis": {
  "lock": "<:lock:EMOJI_ID>",
  "unlock": "<:unlock:EMOJI_ID>",
  "hide": "<:hide:EMOJI_ID>",
  "show": "<:show:EMOJI_ID>",
  "ban": "<:ban:EMOJI_ID>",
  "unban": "<:unban:EMOJI_ID>",
  "call": "<:call:EMOJI_ID>",
  "kick": "<:kick:EMOJI_ID>",
  "rename": "<:rename:EMOJI_ID>",
  "limit": "<:limit:EMOJI_ID>",
  "panel": "<:panel:EMOJI_ID>",
  "success": "<a:success:EMOJI_ID>",
  "error": "<a:error:EMOJI_ID>",
  "owner": "<:owner:EMOJI_ID>"
}
```

Emoji alanları boş veya eksik olduğunda sistem ilgili yerlerde varsayılan emoji değerlerini kullanabilir.

---

## ▶️ Çalıştırma

Botu başlatmak için:

```bash
npm start
```

veya:

```bash
node wase.js
```

Başarılı başlangıç sonrasında bot Discord'a bağlanır, MongoDB bağlantısını kurar ve yapılandırılmışsa bot ses kanalına katılır.

---

## 🧰 Kontrol Panelini Kurma

Prefix varsayılan olarak `.` olduğundan panel komutu:

```text
.controlpanel
```

veya kısa haliyle:

```text
.cp
```

olarak kullanılabilir.

Bu komut yalnızca `wase.json` içerisindeki `allowedUsers` listesinde bulunan kullanıcılar tarafından çalıştırılabilir.

---

## 🗄️ MongoDB Veri Yapısı

Kullanıcı tercihleri `User` modeli üzerinden tutulur.

Temel şema:

```js
{
  userId: String,
  name: String,
  limit: Number
}
```

### Alanlar

- `userId` → Discord kullanıcı ID'si
- `name` → Kullanıcının kaydettiği oda adı
- `limit` → Kullanıcının kaydettiği oda limiti

Bu yapı sayesinde bot, kullanıcıyı daha önce tanıyorsa varsayılan oda tercihlerini yeniden kullanabilir.

---

## 🔐 Discord İzinleri

Botun düzgün çalışabilmesi için Discord tarafında gerekli kanal ve sunucu izinlerinin verilmesi gerekir.

Özellikle aşağıdaki izinler önemlidir:

- View Channels
- Connect
- Speak
- Manage Channels
- Move Members
- Mute Members
- Deafen Members
- Send Messages
- Read Message History
- Use Application Commands / ilgili Discord uygulama izinleri

> [!IMPORTANT]
> Botun rolü, işlem yapılacak kanallar üzerinde gerekli izinlere sahip olmalıdır. Discord'daki kategori ve kanal bazlı permission overwrite'ları botun davranışını etkileyebilir.

---

## 🛡️ Yetkilendirme Modeli

Oda yönetimi genel bir komut sistemi yerine **oda sahipliği** üzerinden tasarlanmıştır.

Bir kullanıcı özel oda oluşturduğunda:

1. Kanalın sahibi kullanıcı olarak kaydedilir.
2. Kullanıcıya kanal yönetimi için gerekli izinler verilir.
3. Kontrol panelindeki işlemler kullanıcının kendi aktif odası üzerinden yürütülür.
4. Kullanıcının aktif odası bulunmuyorsa panel işlemi reddedilir.

Bu yaklaşım, sunucudaki her kullanıcının yalnızca kendi oluşturduğu geçici odayı yönetmesini hedefler.

---

## 🧹 Otomatik Oda Temizleme

Geçici kanalların sunucuda gereksiz şekilde birikmesini önlemek için sistem oda boşaldığında temizlik mekanizmasını çalıştırır.

Akış:

```text
Oda boşaldı
   ↓
5 saniye bekle
   ↓
Kanal hâlâ boş mu?
   ├── Hayır → Kanal korunur
   └── Evet  → Kanal silinir
```

Bu ikinci kontrol, kullanıcıların kısa süreli bağlantı kopmaları veya kanal geçişleri sırasında odanın gereksiz yere silinmesini azaltır.

---

## 🖼️ Dinamik Panel Görseli

Panel sistemi `@napi-rs/canvas` kullanarak sunucuya özel görsel içerik üretebilir.

Panel oluşturulurken:

- Sunucu adı
- Sunucu ikonu
- Özel oda oluşturma kanalının gerçek adı
- Yapılandırılmış emoji bilgileri

gibi bilgiler kullanılabilir.

Üretilen görsel Discord mesajında attachment olarak kullanılır ve Components V2 tabanlı panel ile birlikte sunulur.

---

## 🧩 Kullanılan Teknolojiler

| Teknoloji | Kullanım Alanı |
|---|---|
| **Node.js** | Çalışma ortamı |
| **discord.js v14** | Discord API ve bot altyapısı |
| **@discordjs/voice** | Discord ses bağlantısı |
| **MongoDB** | Kalıcı kullanıcı tercihleri |
| **Mongoose** | MongoDB ODM katmanı |
| **@napi-rs/canvas** | Panel görseli oluşturma |
| **undici** | HTTP istemci işlemleri |
| **global-agent** | Global HTTP/HTTPS agent yapılandırması |

---

## 📁 Ana Dosyaların Görevleri

### `wase.js`

Projenin ana giriş noktasıdır.

Başlıca sorumlulukları:

- Discord client oluşturmak
- MongoDB bağlantısını başlatmak
- Bot hazır olduğunda başlangıç işlemlerini yapmak
- Ses kanalı giriş/çıkışlarını takip etmek
- Geçici oda oluşturmak
- Kullanıcıyı yeni odaya taşımak
- Boş odaları temizlemek
- Prefix komutlarını işlemek
- Buton interaction'larını yönetmek
- Modal işlemlerini yönetmek
- Oda sahibi işlemlerini uygulamak

### `wase.json`

Botun sunucuya özel yapılandırmasının bulunduğu dosyadır.

### `models/User.js`

MongoDB kullanıcı modelini tanımlar ve kullanıcıların oda adı / limit tercihlerini saklar.

### `utils/panel.js`

Kontrol panelini, butonları, Components V2 container yapısını ve bilgi mesajlarını üretir.

### `utils/generatePanel.js`

Kontrol panelinde kullanılan dinamik görselin oluşturulmasından sorumludur.

---

## 🧪 Sorun Giderme

### Bot açılıyor fakat özel oda oluşturmuyor

Şunları kontrol edin:

1. `joinChannelId` doğru mu?
2. Bot kanalı görebiliyor mu?
3. Botun `Manage Channels` yetkisi var mı?
4. `Move Members` yetkisi var mı?
5. `categoryId` doğru mu?
6. Discord'daki kanal/kategori permission overwrite'ları botu engelliyor mu?

### MongoDB bağlantısı başarısız

`mongoUri` değerinin doğru olduğundan emin olun.

MongoDB Atlas kullanıyorsanız:

- Network Access ayarlarını kontrol edin.
- Database user bilgilerinin doğru olduğundan emin olun.
- Connection string içerisindeki özel karakterleri gerektiğinde encode edin.

### Bot ses kanalına giremiyor

`botVoiceChannelId` değerini kontrol edin ve botun ilgili ses kanalına bağlanabildiğinden emin olun.

### `.cp` çalışmıyor

`allowedUsers` içerisinde komutu kullanan Discord kullanıcı ID'sinin bulunduğundan emin olun.

Örnek:

```json
"allowedUsers": [
  "123456789012345678"
]
```

---

## 🔒 Güvenlik Önerileri

Production kullanımında aşağıdaki uygulamalar önerilir:

### Bot token'ını paylaşmayın

```text
❌ GitHub'a token yüklemeyin
❌ Discord'da paylaşmayın
❌ Ekran görüntüsünde göstermeyin
```

Token sızdıysa Discord Developer Portal üzerinden token'ı yenileyin.

### MongoDB URI'sini gizleyin

MongoDB bağlantı adresi kullanıcı adı ve parola içerebileceğinden public repository'ye eklenmemelidir.

### `wase.json` yerine environment variable kullanın

Production için örneğin:

```env
DISCORD_TOKEN=...
MONGODB_URI=...
CLIENT_ID=...
```

şeklinde gizli değişkenler kullanılabilir.

---

## 🗺️ Yol Haritası

Aşağıdaki fikirler projenin gelecekte geliştirilebilecek alanlarıdır:

- [ ] Slash command desteği
- [ ] Daha gelişmiş oda istatistikleri
- [ ] Oda whitelist sistemi
- [ ] Kullanıcı bazlı oda blacklist kalıcılığı
- [ ] Oda sahibi devrettiğinde sahiplik aktarımı
- [ ] Oda ayarlarının daha kapsamlı MongoDB modeli
- [ ] Çoklu sunucu yapılandırması
- [ ] Web tabanlı yönetim paneli
- [ ] Daha gelişmiş log sistemi
- [ ] Dil desteği
- [ ] Gelişmiş hata / audit log sistemi

---

## 🤝 Katkıda Bulunma

Katkıda bulunmak istiyorsanız:

```bash
git clone https://github.com/WaseJS/v14-ozel-oda.git
cd v14-ozel-oda
npm install
```

Daha sonra kendi branch'inizi oluşturabilirsiniz:

```bash
git checkout -b feature/yeni-ozellik
```

Değişikliklerinizi tamamladıktan sonra commit oluşturun:

```bash
git add .
git commit -m "feat: yeni özellik eklendi"
git push origin feature/yeni-ozellik
```

Ardından GitHub üzerinden Pull Request açabilirsiniz.

---

## 📜 Lisans

Bu proje repository içerisinde bulunan **LICENSE** dosyası kapsamında lisanslanmıştır.

Detaylar için:

<a href="https://github.com/WaseJS/v14-ozel-oda/blob/main/LICENSE">LICENSE</a>

---

## 👨‍💻 Geliştirici

<div align="center">

### WaseJS

Discord.js, Node.js ve web tabanlı projeler geliştiren bağımsız geliştirici.

<p>
  <a href="https://github.com/WaseJS">GitHub</a> ·
  <a href="https://instagram.com/wase.js">Instagram</a> ·
  <a href="https://discord.com/users/517984021800812547">Discord</a>
</p>

</div>

---

<div align="center">

**⭐ Projeyi beğendiyseniz GitHub'da yıldız bırakmayı unutmayın!**

Made with ❤️ by **WaseJS**

</div>
