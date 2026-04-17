# GitHub Releases Üzerinden Trimly AI Kurulumu

Bu rehber, son kullanıcıların Trimly AI uzantısını GitHub Releases sayfasından nasıl kuracağını açıklar.

## 1. Doğru dosyayı indirin

1. Repodaki `Releases` sayfasını açın.
2. En güncel sürümü açın (örnek: `v0.1.1`).
3. `Assets` bölümünden adı `-chrome.zip` ile biten dosyayı indirin.
4. ZIP dosyasını bilgisayarınızda bir klasöre çıkarın.

Örnek dosya adı:

`trimlyai-chrome-extension-0.1.1-chrome.zip`

## 2. Uzantıyı Chrome'a yükleyin

1. `chrome://extensions` adresini açın.
2. Sağ üstten `Developer mode` seçeneğini açın.
3. `Load unpacked` butonuna tıklayın.
4. ZIP’ten çıkardığınız ve içinde `manifest.json` bulunan **klasörü** seçin.

Bundan sonra Trimly AI, uzantı listesinde ve araç çubuğunda görünecektir.

## 3. Yeni sürüme güncelleme

GitHub Releases üzerinden `Load unpacked` olarak kurulan uzantılar otomatik güncellenmez.

Güncelleme için:
1. Yeni sürümün `-chrome.zip` dosyasını indirin.
2. ZIP’i çıkarın.
3. `chrome://extensions` üzerinden eski Trimly AI kurulumunu kaldırın.
4. Yeni klasörü tekrar `Load unpacked` ile yükleyin.

## Sorun Giderme

- `Manifest file is missing or unreadable` hatası:
  Yanlış klasör seçilmiş olabilir. Doğrudan `manifest.json` içeren klasörü seçin.
- Uzantı yenilemeden sonra pasif kaldı:
  `chrome://extensions` sayfasından Trimly AI uzantısını tekrar etkinleştirin.
- Uzantı çalışıyor gibi görünmüyor:
  Uzantı ayarlarında OpenAI API anahtarının tanımlı olduğunu kontrol edin.
