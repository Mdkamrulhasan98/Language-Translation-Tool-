// ভাষার তালিকা (কোড : নাম)
const languages = {
  "en": "English",
  "bn": "Bengali (বাংলা)",
  "hi": "Hindi (हिन्दी)",
  "ur": "Urdu (اردو)",
  "ar": "Arabic (العربية)",
  "es": "Spanish",
  "fr": "French",
  "de": "German",
  "ru": "Russian",
  "tr": "Turkish",
  "ja": "Japanese",
  "zh-CN": "Chinese (简体)"
};

// HTML এলিমেন্টগুলো ধরা
const sourceLang = document.getElementById("sourceLang");
const targetLang = document.getElementById("targetLang");
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const translateBtn = document.getElementById("translateBtn");
const copyBtn = document.getElementById("copyBtn");
const speakBtn = document.getElementById("speakBtn");
const swapBtn = document.getElementById("swapBtn");
const charCount = document.getElementById("charCount");

// ড্রপডাউনে ভাষা বসানো
sourceLang.innerHTML = '<option value="autodetect">Detect language (অটো)</option>';
for (const code in languages) {
  sourceLang.innerHTML += `<option value="${code}">${languages[code]}</option>`;
  targetLang.innerHTML += `<option value="${code}">${languages[code]}</option>`;
}
sourceLang.value = "en";
targetLang.value = "bn";

// অক্ষর গণনা
inputText.addEventListener("input", () => {
  charCount.textContent = inputText.value.length;
});

// অনুবাদ ফাংশন
async function translateText() {
  const text = inputText.value.trim();
  if (!text) {
    showOutput("দয়া করে কিছু টেক্সট লিখুন।", true);
    return;
  }

  const from = sourceLang.value;
  const to = targetLang.value;
  const langPair = `${from}|${to}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`;

  translateBtn.disabled = true;
  translateBtn.textContent = "Translating...";

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.responseStatus === 200) {
      showOutput(data.responseData.translatedText, false);
    } else {
      showOutput("ত্রুটি: " + data.responseDetails, true);
    }
  } catch (error) {
    showOutput("ইন্টারনেট সংযোগ বা API তে সমস্যা হয়েছে।", true);
    console.error(error);
  } finally {
    translateBtn.disabled = false;
    translateBtn.textContent = "Translate";
  }
}

function showOutput(message, isError) {
  outputText.textContent = message;
  outputText.classList.toggle("error", isError);
}

// কপি বাটন
copyBtn.addEventListener("click", async () => {
  const text = outputText.textContent;
  if (!text || outputText.classList.contains("error")) return;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "✅ Copied!";
  } catch (e) {
    copyBtn.textContent = "❌ Failed";
  }
  setTimeout(() => (copyBtn.textContent = "📋 Copy"), 1500);
});

// টেক্সট-টু-স্পিচ বাটন
speakBtn.addEventListener("click", () => {
  const text = outputText.textContent;
  if (!text || outputText.classList.contains("error")) return;
  if (!("speechSynthesis" in window)) {
    alert("আপনার ব্রাউজার Text-to-Speech সাপোর্ট করে না।");
    return;
  }
  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = targetLang.value;
  window.speechSynthesis.speak(speech);
});

// ভাষা অদলবদল
swapBtn.addEventListener("click", () => {
  if (sourceLang.value === "autodetect") return;
  const tempLang = sourceLang.value;
  sourceLang.value = targetLang.value;
  targetLang.value = tempLang;

  const tempText = inputText.value;
  inputText.value = outputText.textContent.includes("এখানে দেখাবে") ? "" : outputText.textContent;
  outputText.textContent = tempText;
  charCount.textContent = inputText.value.length;
});

translateBtn.addEventListener("click", translateText);