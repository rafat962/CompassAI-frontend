import i18next from "i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

const savedLang = JSON.parse(localStorage.getItem("lang")) || "en"; // Default to 'en' if nothing saved

// document.documentElement.dir = i18next.language === "ar" ? "rtl" : "ltr";
i18next
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: "en",
        lng: savedLang,
        interpolation: {
            escapeValue: false,
        },
        supportedLngs: ["en", "ar", "fr"],
    });
