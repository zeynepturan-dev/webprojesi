// ---------- Değişkenler ----------
const ANAHTAR_ARAC = "garajAraclar";
const ANAHTAR_KULLANICI = "garajKullanici";

let araclar = JSON.parse(localStorage.getItem(ANAHTAR_ARAC)) || [];
let aktifFiltre = "tumu";

const girisEkrani = document.getElementById("girisEkrani");
const uygulama = document.getElementById("uygulama");
const kullaniciForm = document.getElementById("kullaniciForm");
const kullaniciAdi = document.getElementById("kullaniciAdi");
const karsilama = document.getElementById("karsilama");
const cikisBtn = document.getElementById("cikisBtn");

const aracForm = document.getElementById("aracForm");
const aracId = document.getElementById("aracId");
const marka = document.getElementById("marka");
const model = document.getElementById("model");
const yil = document.getElementById("yil");
const yakit = document.getElementById("yakit");
const hata = document.getElementById("hata");
const formBaslik = document.getElementById("formBaslik");
const kaydetBtn = document.getElementById("kaydetBtn");
const iptalBtn = document.getElementById("iptalBtn");

const aracListesi = document.getElementById("aracListesi");
const bosMesaj = document.getElementById("bosMesaj");
const sayac = document.getElementById("sayac");
const arama = document.getElementById("arama");

// ---------- Kullanıcı ----------
function kullaniciyiGoster() {
  const ad = localStorage.getItem(ANAHTAR_KULLANICI);
  if (ad) {
    girisEkrani.hidden = true;
    uygulama.hidden = false;
    karsilama.textContent = "Hoş geldin, " + ad + ". Garajında " + araclar.length + " araç var.";
    listele();
  } else {
    girisEkrani.hidden = false;
    uygulama.hidden = true;
    kullaniciAdi.focus();
  }
}

kullaniciForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const ad = kullaniciAdi.value.trim();
  if (!ad) return;
  localStorage.setItem(ANAHTAR_KULLANICI, ad);
  kullaniciyiGoster();
});

cikisBtn.addEventListener("click", function () {
  localStorage.removeItem(ANAHTAR_KULLANICI);
  kullaniciAdi.value = "";
  kullaniciyiGoster();
});

// ---------- Kaydetme ----------
function kaydet() {
  localStorage.setItem(ANAHTAR_ARAC, JSON.stringify(araclar));
}

// ---------- Ekle / Düzenle ----------
aracForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const m = marka.value.trim();
  const mo = model.value.trim();
  const y = Number(yil.value);
  const yk = yakit.value;

  if (!m || !mo || !yil.value || !yk) {
    hata.textContent = "Marka, model, model yılı ve yakıt türünü doldurun.";
    return;
  }
  if (y < 1950 || y > 2035) {
    hata.textContent = "Model yılı 1950 ile 2035 arasında olmalı.";
    return;
  }
  hata.textContent = "";

  if (aracId.value) {
    // Düzenleme
    const arac = araclar.find(function (a) { return a.id === Number(aracId.value); });
    arac.marka = m;
    arac.model = mo;
    arac.yil = y;
    arac.yakit = yk;
  } else {
    // Yeni ekleme
    araclar.push({ id: Date.now(), marka: m, model: mo, yil: y, yakit: yk, favori: false });
  }

  kaydet();
  formuSifirla();
  kullaniciyiGoster();
});

function formuSifirla() {
  aracForm.reset();
  aracId.value = "";
  hata.textContent = "";
  formBaslik.textContent = "Yeni araç ekle";
  kaydetBtn.textContent = "Aracı ekle";
  iptalBtn.hidden = true;
}
iptalBtn.addEventListener("click", formuSifirla);

// ---------- Listeleme ----------
function listele() {
  const aranan = arama.value.trim().toLowerCase();

  const gosterilecek = araclar.filter(function (a) {
    const filtreUyar = aktifFiltre === "tumu" || a.favori;
    const metin = (a.marka + " " + a.model).toLowerCase();
    return filtreUyar && metin.includes(aranan);
  });

  aracListesi.innerHTML = "";

  gosterilecek.forEach(function (a) {
    const kart = document.createElement("article");
    kart.className = "kart" + (a.favori ? " favori" : "");

    const ust = document.createElement("div");
    ust.className = "kart-ust";
    ust.innerHTML =
      '<p class="marka"></p><h3 class="model"></h3>' +
      '<div class="plaka"><span class="yil"></span><span class="yakit"></span></div>';
    // textContent ile güvenli yazım
    ust.querySelector(".marka").textContent = a.marka;
    ust.querySelector(".model").textContent = a.model;
    ust.querySelector(".yil").textContent = a.yil;
    ust.querySelector(".yakit").textContent = a.yakit;

    const alt = document.createElement("div");
    alt.className = "kart-alt";
    alt.innerHTML =
      '<button class="ikon-btn fav' + (a.favori ? " fav-aktif" : "") + '" type="button" aria-pressed="' + a.favori + '">' +
      (a.favori ? "★ Favoride" : "☆ Favori") + '</button>' +
      '<button class="ikon-btn duzenle" type="button">Düzenle</button>' +
      '<button class="ikon-btn sil" type="button">Sil</button>';

    alt.querySelector(".fav").addEventListener("click", function () { favoriDegistir(a.id); });
    alt.querySelector(".duzenle").addEventListener("click", function () { duzenle(a.id); });
    alt.querySelector(".sil").addEventListener("click", function () { sil(a.id); });

    kart.appendChild(ust);
    kart.appendChild(alt);
    aracListesi.appendChild(kart);
  });

  sayac.textContent = gosterilecek.length + " araç gösteriliyor";

  if (araclar.length === 0) {
    bosMesaj.textContent = "Garajın boş. Soldaki formdan ilk aracını ekle.";
    bosMesaj.hidden = false;
  } else if (gosterilecek.length === 0) {
    bosMesaj.textContent = aktifFiltre === "favori" && !aranan
      ? "Henüz favori aracın yok. Bir kartta \u201CFavori\u201D düğmesine bas."
      : "Aramana uyan araç bulunamadı.";
    bosMesaj.hidden = false;
  } else {
    bosMesaj.hidden = true;
  }

  const ad = localStorage.getItem(ANAHTAR_KULLANICI);
  if (ad) karsilama.textContent = "Hoş geldin, " + ad + ". Garajında " + araclar.length + " araç var.";
}

// ---------- İşlemler ----------
function favoriDegistir(id) {
  const arac = araclar.find(function (a) { return a.id === id; });
  arac.favori = !arac.favori;
  kaydet();
  listele();
}

function duzenle(id) {
  const arac = araclar.find(function (a) { return a.id === id; });
  aracId.value = arac.id;
  marka.value = arac.marka;
  model.value = arac.model;
  yil.value = arac.yil;
  yakit.value = arac.yakit;
  formBaslik.textContent = "Aracı düzenle";
  kaydetBtn.textContent = "Değişiklikleri kaydet";
  iptalBtn.hidden = false;
  marka.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function sil(id) {
  const arac = araclar.find(function (a) { return a.id === id; });
  if (!confirm(arac.marka + " " + arac.model + " aracı silinsin mi?")) return;
  araclar = araclar.filter(function (a) { return a.id !== id; });
  kaydet();
  if (Number(aracId.value) === id) formuSifirla();
  listele();
}

// ---------- Filtre ve arama ----------
document.querySelectorAll(".filtre").forEach(function (btn) {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".filtre").forEach(function (b) { b.classList.remove("aktif"); });
    btn.classList.add("aktif");
    aktifFiltre = btn.dataset.filtre;
    listele();
  });
});
arama.addEventListener("input", listele);

// ---------- Başlat ----------
kullaniciyiGoster();
