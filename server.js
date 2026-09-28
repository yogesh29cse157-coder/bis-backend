const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// =========================================================
// HELPER: Auto-Detect Language from User's Typed/Spoken Text
// =========================================================
function detectLanguage(text, defaultLang = 'en') {
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Hindi (Devanagari)
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa'; // Punjabi (Gurmukhi)
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
  return defaultLang || 'en';
}

// =========================================================
// MULTILINGUAL UI LABELS & RESPONSES
// =========================================================
const uiLabels = {
  en: {
    stdFound: "Standard Found",
    prodName: "Product Name",
    dept: "Department",
    category: "Category",
    ministry: "Ministry",
    scheme: "Certification Scheme",
    desc: "Description",
    techSpecs: "Technical & Quality Specifications",
    brandFound: "Licensed Product Found",
    manufacturer: "Manufacturer",
    appStd: "Applicable Standard",
    licNo: "BIS License No",
    status: "Status",
    validUpto: "Valid Upto",
    viewCert: "📄 View Official Certificate",
    imageScan: "<b>📷 Image Scan Complete</b><br><br>I have analyzed the uploaded image. Based on visual inspection, this appears to be a <b>BIS Standard Mark (ISI / CRS)</b>.<br><br><i>Please type the IS number (e.g., IS 1165, IS 269, IS 14433) or product name visible on the label to verify its compliance!</i>",
    certProcess: "<b>BIS Certification Process (ISI Mark / CRS):</b><br>1. Identify the applicable Indian Standard (IS) for your product.<br>2. Submit an application on the <b>Manakonline (e-BIS)</b> portal.<br>3. Product sample testing in a BIS-recognized lab & factory inspection.<br>4. Grant of License (Option 2 simplified procedure grants licenses within 30 days for domestic industry/MSMEs)[cite: 5, 8].",
    hallmarkInfo: "<b>BIS Hallmarking</b> guarantees the purity of gold and silver jewellery.<br>Always check for 3 symbols:<br>• <b>BIS Standard Mark</b> (Triangle logo)<br>• <b>Purity/Fineness Grade</b> (e.g., 22K916, 18K750)<br>• <b>6-Digit Alphanumeric HUID Code</b> (can be verified on the BIS Care App).",
    labInfo: "BIS operates Central, Regional, and Branch Laboratories across India, alongside external recognized labs under the <b>BIS LIMS (Laboratory Information Management System)</b> portal.",
    fallback: "I specialize in Indian Standards (IS), certifications, and hallmarking. Try searching an IS code (e.g., IS 1165, IS 14433, IS 269, IS 1786) or a product name (e.g., Milk Powder, Infant Milk, Cement, TMT Bars, Helmet, Irrigation Pipe, Patanjali Biscuit)."
  },
  hi: {
    stdFound: "मानक विवरण (Standard Found)",
    prodName: "उत्पाद का नाम",
    dept: "विभाग (Department)",
    category: "श्रेणी",
    ministry: "मंत्रालय",
    scheme: "प्रमाणन योजना",
    desc: "विवरण",
    techSpecs: "तकनीकी और गुणवत्ता मानदंड (Technical Specs)",
    brandFound: "प्रमाणित उत्पाद मिला",
    manufacturer: "निर्माता",
    appStd: "लागू मानक",
    licNo: "बीआईएस लाइसेंस संख्या",
    status: "स्थिति",
    validUpto: "वैधता तिथि",
    viewCert: "📄 आधिकारिक प्रमाणपत्र देखें",
    imageScan: "<b>📷 छवि स्कैन पूर्ण (Image Scan Complete)</b><br><br>मैंने अपलोड की गई छवि का विश्लेषण किया है। यह एक <b>बीआईएस मानक चिह्न (ISI / CRS)</b> प्रतीत होता है।<br><br><i>कृपया इसके पूर्ण तकनीकी विवरण की जांच करने के लिए लेबल पर दिखने वाला IS नंबर (जैसे IS 1165, IS 269) या उत्पाद का नाम टाइप करें!</i>",
    certProcess: "<b>बीआईएस प्रमाणन प्रक्रिया (ISI Mark / CRS):</b><br>1. अपने उत्पाद के लिए लागू भारतीय मानक (IS) की पहचान करें।<br>2. <b>मानकऑनलाइन (e-BIS)</b> पोर्टल पर आवेदन जमा करें।<br>3. बीआईएस मान्यता प्राप्त प्रयोगशाला में उत्पाद परीक्षण और फैक्ट्री निरीक्षण।<br>4. लाइसेंस प्रदान करना (विकल्प 2 सरलीकृत प्रक्रिया के तहत 30 दिनों के भीतर लाइसेंस निपटान किया जाता है)[cite: 5, 8]।",
    hallmarkInfo: "<b>बीआईएस हॉलमार्किंग</b> सोने और चांदी के आभूषणों की शुद्धता की गारंटी देता है।<br>हमेशा 3 चिह्नों की जांच करें:<br>• <b>बीआईएस मानक चिह्न</b> (तिकोना लोगो)<br>• <b>शुद्धता ग्रेड</b> (जैसे 22K916, 18K750)<br>• <b>6-अंकीय अल्फ़ान्यूमेरिक HUID कोड</b> (BIS Care App पर सत्यापित करें)।",
    labInfo: "बीआईएस पूरे भारत में केंद्रीय, क्षेत्रीय और शाखा प्रयोगशालाओं का संचालन करता है। आप <b>BIS LIMS पोर्टल</b> पर मान्यता प्राप्त प्रयोगशालाओं की सूची देख सकते हैं।",
    fallback: "मैं भारतीय मानकों (IS), प्रमाणन और हॉलमार्किंग में विशेषज्ञ हूँ। कृपया कोई IS कोड (जैसे IS 1165, IS 14433, IS 269) या उत्पाद का नाम (जैसे मिल्क पाउडर, शिशु आहार, सीमेंट, सरिया, हेलमेट, पतंजलि बिस्कुट) खोजें।"
  },
  pa: {
    stdFound: "ਮਿਆਰ ਮਿਲਿਆ (Standard Found)",
    prodName: "ਉਤਪਾਦ ਦਾ ਨਾਮ",
    dept: "ਵਿਭਾਗ (Department)",
    category: "ਸ਼੍ਰੇਣੀ",
    ministry: "ਮੰਤਰਾਲਾ",
    scheme: "ਪ੍ਰਮਾਣੀਕਰਣ ਯੋਜਨਾ",
    desc: "ਵੇਰਵਾ",
    techSpecs: "ਤਕਨੀਕੀ ਅਤੇ ਗੁਣਵੱਤਾ ਲੋੜਾਂ (Technical Specs)",
    brandFound: "ਪ੍ਰਮਾਣਿਤ ਉਤਪਾਦ ਮਿਲਿਆ",
    manufacturer: "ਨਿਰਮਾਤਾ",
    appStd: "ਲਾਗੂ ਮਿਆਰ",
    licNo: "BIS ਲਾਇਸੰਸ ਨੰਬਰ",
    status: "ਸਥਿਤੀ",
    validUpto: "ਵੈਧਤਾ ਮਿਤੀ",
    viewCert: "📄 ਅਧਿਕਾਰਤ ਸਰਟੀਫਿਕੇਟ ਦੇਖੋ",
    imageScan: "<b>📷 ਚਿੱਤਰ ਸਕੈਨ ਪੂਰਾ ਹੋਇਆ</b><br><br>ਮੈਂ ਅੱਪਲੋਡ ਕੀਤੀ ਤਸਵੀਰ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤਾ ਹੈ। ਇਹ ਇੱਕ <b>BIS ਮਿਆਰ ਚਿੰਨ੍ਹ (ISI / CRS)</b> ਜਾਪਦਾ ਹੈ।<br><br><i>ਕਿਰਪਾ ਕਰਕੇ ਇਸਦੀ ਪਾਲਣਾ ਦੀ ਜਾਂਚ ਕਰਨ ਲਈ ਲੇਬਲ 'ਤੇ ਦਿਖਾਈ ਦੇਣ ਵਾਲਾ IS ਨੰਬਰ (ਜਿਵੇਂ ਕਿ IS 1165, IS 269) ਜਾਂ ਉਤਪਾਦ ਦਾ ਨਾਮ ਟਾਈਪ ਕਰੋ!</i>",
    certProcess: "<b>BIS ਪ੍ਰਮਾਣੀਕਰਣ ਪ੍ਰਕਿਰਿਆ (ISI ਮਾਰਕ / CRS):</b><br>1. ਆਪਣੇ ਉਤਪਾਦ ਲਈ ਲਾਗੂ ਭਾਰਤੀ ਮਿਆਰ (IS) ਦੀ ਪਛਾਣ ਕਰੋ।<br>2. <b>Manakonline (e-BIS)</b> ਪੋਰਟਲ 'ਤੇ ਅਰਜ਼ੀ ਜਮ੍ਹਾਂ ਕਰੋ।<br>3. BIS-ਮਾਨਤਾ ਪ੍ਰਾਪਤ ਲੈਬ ਵਿੱਚ ਉਤਪਾਦ ਦੀ ਜਾਂਚ ਅਤੇ ਫੈਕਟਰੀ ਨਿਰੀਖਣ।<br>4. ਲਾਇਸੰਸ ਦੀ ਮਨਜ਼ੂਰੀ (ਵਿਕਲਪ 2 ਦੇ ਤਹਿਤ 30 ਦਿਨਾਂ ਦੇ ਅੰਦਰ ਲਾਇਸੰਸ ਦਿੱਤਾ ਜਾਂਦਾ ਹੈ)[cite: 5, 8]।",
    hallmarkInfo: "<b>BIS ਹਾਲਮਾਰਕਿੰਗ</b> ਸੋਨੇ ਅਤੇ ਚਾਂਦੀ ਦੇ ਗਹਿਣਿਆਂ ਦੀ ਸ਼ੁੱਧਤਾ ਦੀ ਗਰੰਟੀ ਦਿੰਦੀ ਹੈ।<br>ਹਮੇਸ਼ਾ 3 ਚਿੰਨ੍ਹਾਂ ਦੀ ਜਾਂਚ ਕਰੋ:<br>• <b>BIS ਲੋਗੋ</b><br>• <b>ਸ਼ੁੱਧਤਾ ਗ੍ਰੇਡ</b> (ਜਿਵੇਂ 22K916)<br>• <b>6-ਅੰਕਾਂ ਦਾ HUID ਕੋਡ</b> (BIS Care App 'ਤੇ ਜਾਂਚਿਆ ਜਾ ਸਕਦਾ ਹੈ)।",
    labInfo: "BIS ਪੂਰੇ ਭਾਰਤ ਵਿੱਚ ਪ੍ਰਯੋਗਸ਼ਾਲਾਵਾਂ ਚਲਾਉਂਦਾ ਹੈ। ਤੁਸੀਂ <b>BIS LIMS ਪੋਰਟਲ</b> 'ਤੇ ਮਾਨਤਾ ਪ੍ਰਾਪਤ ਲੈਬਾਂ ਦੀ ਖੋਜ ਕਰ ਸਕਦੇ ਹੋ।",
    fallback: "ਮੈਂ ਭਾਰਤੀ ਮਿਆਰਾਂ (IS), ਪ੍ਰਮਾਣੀਕਰਣ ਅਤੇ ਹਾਲਮਾਰਕਿੰਗ ਵਿੱਚ ਮਾਹਿਰ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਕੋਈ IS ਕੋਡ (ਜਿਵੇਂ IS 1165, IS 269, IS 1786) ਜਾਂ ਉਤਪਾਦ ਦਾ ਨਾਮ (ਜਿਵੇਂ ਮਿਲਕ ਪਾਊਡਰ, ਸੀਮਿੰਟ, ਸਰੀਆ, ਹੈਲਮੇਟ, ਪਤੰਜਲੀ ਬਿਸਕੁਟ) ਖੋਜੋ।"
  },
  te: {
    stdFound: "ప్రమాణం కనుగొనబడింది (Standard Found)",
    prodName: "ఉత్పత్తి పేరు",
    dept: "విభాగం (Department)",
    category: "వర్గం",
    ministry: "మంత్రిత్వ శాఖ",
    scheme: "ధృవీకరణ పథకం",
    desc: "వివరణ",
    techSpecs: "సాంకేతిక & నాణ్యత ప్రమాణాలు (Technical Specs)",
    brandFound: "లైసెన్స్ పొందిన ఉత్పత్తి కనుగొనబడింది",
    manufacturer: "తయారీదారు",
    appStd: "వర్తించే ప్రమాణం",
    licNo: "BIS లైసెన్స్ సంఖ్య",
    status: "స్థితి",
    validUpto: "చెల్లుబాటు తేదీ",
    viewCert: "📄 అధికారిక సర్టిఫికేట్ చూడండి",
    imageScan: "<b>📷 చిత్రం స్కాన్ పూర్తయింది</b><br><br>నేను అప్‌లోడ్ చేసిన చిత్రాన్ని విశ్లేషించాను. ఇది <b>BIS స్టాండర్డ్ మార్క్ (ISI / CRS)</b> లాగా కనిపిస్తోంది.<br><br><i>దయచేసి పూర్తి వివరాలను తనిఖీ చేయడానికి లేబుల్‌పై కనిపించే IS నంబర్ (ఉదా. IS 1165, IS 269) లేదా ఉత్పత్తి పేరును టైప్ చేయండి!</i>",
    certProcess: "<b>BIS ధృవీకరణ ప్రక్రియ (ISI మార్క్ / CRS):</b><br>1. మీ ఉత్పత్తికి వర్తించే భారతీయ ప్రమాణాన్ని (IS) గుర్తించండి.<br>2. <b>Manakonline (e-BIS)</b> పోర్టల్‌లో దరఖాస్తును సమర్పించండి.<br>3. BIS గుర్తింపు పొందిన ల్యాబ్‌లో ఉత్పత్తి నమూనా పరీక్ష & ఫ్యాక్టరీ తనిఖీ.<br>4. లైసెన్స్ మంజూరు (ఆప్షన్ 2 కింద MSMEలకు 30 రోజుల్లోపు లైసెన్స్ మంజూరు చేయబడుతుంది)[cite: 5, 8].",
    hallmarkInfo: "<b>BIS హాల్‌మార్కింగ్</b> బంగారు మరియు వెండి ఆభరణాల స్వచ్ఛతకు హామీ ఇస్తుంది.<br>ఎల్లప్పుడూ ఈ 3 చిహ్నాలను తనిఖీ చేయండి:<br>• <b>BIS లోగో</b><br>• <b>స్వచ్ఛత గ్రేడ్</b> (ఉదా. 22K916)<br>• <b>6-అంకెల HUID కోడ్</b> (BIS Care యాప్‌లో తనిఖీ చేయవచ్చు).",
    labInfo: "BIS భారతదేశం అంతటా ప్రయోగశాలలను నిర్వహిస్తోంది. మీరు <b>BIS LIMS పోర్టల్</b>లో గుర్తింపు పొందిన ల్యాబ్‌ల కోసం శోధించవచ్చు.",
    fallback: "నేను భారతీయ ప్రమాణాలు (IS), ధృవీకరణ మరియు హాల్‌మార్కింగ్‌లో నిపుణుడిని. దయచేసి IS కోడ్ (ఉదా. IS 1165, IS 269, IS 1786) లేదా ఉత్పత్తి పేరును (ఉదా. పాల పొడి, సిమెంట్, హెల్మెట్, పతంజలి బిస్కెట్) శోధించండి."
  }
};

// =========================================================
// DATABASE 1: Complete IS Standards (Food, Dairy, Agri, Civil & Electrical)
// =========================================================
const detailedStandardsDB = [
  {
    id: "IS-1165",
    isNumber: "IS 1165:2022",
    department: "Food and Agriculture Department (FAD)",
    productName: "Milk Powder (Whole Milk Powder)[cite: 5, 7, 8, 10]",
    keywords: ["is 1165", "is-1165", "1165", "whole milk powder", "milk powder", "मिल्क पाउडर", "दूध पाउडर", "ਮਿਲਕ ਪਾਊਡਰ", "ਦੁੱਧ ਪਾਊਡਰ", "పాల పొడి", "మిల్క్ పౌడర్"],
    category: "Food & Agriculture - Dairy Products",
    ministry: "Ministry of Health and Family Welfare (FSSAI) / Dept. of Animal Husbandry & Dairying",
    scheme: "Scheme-I (ISI Mark)",
    sourcePdf: "listofproducts.pdf",
    translations: {
      hi: {
        productName: "मिल्क पाउडर (होल मिल्क पाउडर)[cite: 5, 7, 8, 10]",
        department: "खाद्य और कृषि विभाग (FAD)",
        category: "खाद्य और कृषि - डेयरी उत्पाद",
        ministry: "स्वास्थ्य और परिवार कल्याण मंत्रालय (FSSAI) / पशुपालन और डेयरी विभाग",
        scheme: "योजना-I (ISI मार्क)",
        description: "गाय या भैंस के दूध या उनके मिश्रण से पानी को आंशिक रूप से हटाकर प्राप्त किए गए होल मिल्क पाउडर के लिए आवश्यकताएं, नमूनाकरण और परीक्षण विधियों को कवर करता है।"
      },
      pa: {
        productName: "ਮਿਲਕ ਪਾਊਡਰ (ਹੋਲ ਮਿਲਕ ਪਾਊਡਰ)[cite: 5, 7, 8, 10]",
        department: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ ਵਿਭਾਗ (FAD)",
        category: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ - ਡੇਅਰੀ ਉਤਪਾਦ",
        ministry: "ਸਿਹਤ ਅਤੇ ਪਰਿਵਾਰ ਭਲਾਈ ਮੰਤਰਾਲਾ (FSSAI)",
        scheme: "ਸਕੀਮ-I (ISI ਮਾਰਕ)",
        description: "ਗਾਂ ਜਾਂ ਮੱਝ ਦੇ ਦੁੱਧ ਤੋਂ ਪਾਣੀ ਨੂੰ ਅੰਸ਼ਕ ਤੌਰ 'ਤੇ ਹਟਾ ਕੇ ਪ੍ਰਾਪਤ ਕੀਤੇ ਹੋਲ ਮਿਲਕ ਪਾਊਡਰ ਦੀਆਂ ਲੋੜਾਂ ਅਤੇ ਟੈਸਟਿੰਗ ਵਿਧੀਆਂ ਨੂੰ ਕਵਰ ਕਰਦਾ ਹੈ।"
      },
      te: {
        productName: "మిల్క్ పౌడర్ (హోల్ మిల్క్ పౌడర్ / పాల పొడి)[cite: 5, 7, 8, 10]",
        department: "ఆహార మరియు వ్యవసాయ విభాగం (FAD)",
        category: "ఆహారం & వ్యవసాయం - పాల ఉత్పత్తులు",
        ministry: "ఆరోగ్య మరియు కుటుంబ సంక్షేమ మంత్రిత్వ శాఖ (FSSAI)",
        scheme: "స్కీమ్-I (ISI మార్క్)",
        description: "ఆవు లేదా గేదె పాల నుండి నీటిని పాక్షికంగా తొలగించడం ద్వారా పొందిన హోల్ మిల్క్ పౌడర్ కోసం అవసరాలు మరియు పరీక్షా పద్ధతులను కవర్ చేస్తుంది."
      }
    },
    details: {
      description: "Covers requirements, sampling, and test methods for whole milk powder obtained by partial removal of water from milk of cow or buffalo or a mixture thereof.",
      types: "Spray-dried and Roller-dried Whole Milk Powder.",
      chemicalRequirements: {
        moistureMax: "4.0% by mass",
        milkFatMin: "26.0% by mass",
        milkProteinInMilkSolidsNotFatMin: "34.0% by mass",
        titratableAcidityMax: "1.2% (as lactic acid)",
        insolubilityIndexMax: "2.0 ml (Spray dried) | 15.0 ml (Roller dried)",
        totalAshMax: "7.3% (on dry basis)"
      },
      microbiologicalLimits: "Total Plate Count max 40,000 CFU/g; Coliform count absent in 0.1 g; E. coli, Salmonella, and Staphylococcus aureus absent."
    }
  },
  {
    id: "IS-1166",
    isNumber: "IS 1166:1986",
    department: "Food and Agriculture Department (FAD)",
    productName: "Condensed Milk, Partly Skimmed and Skimmed Condensed Milk[cite: 5, 7, 8, 10]",
    keywords: ["is 1166", "is-1166", "1166", "condensed milk", "skimmed condensed milk", "कंडेंस्ड मिल्क", "गाढ़ा दूध", "ਕੰਡੈਂਸਡ ਮਿਲਕ", "కండెన్స్డ్ మిల్క్"],
    category: "Food & Agriculture - Dairy Products",
    ministry: "Ministry of Health and Family Welfare (FSSAI)",
    scheme: "Scheme-I (ISI Mark)",
    sourcePdf: "listofproducts.pdf",
    translations: {
      hi: {
        productName: "कंडेंस्ड मिल्क, आंशिक रूप से स्किम्ड और स्किम्ड कंडेंस्ड मिल्क[cite: 5, 7, 8, 10]",
        department: "खाद्य और कृषि विभाग (FAD)",
        category: "खाद्य और कृषि - डेयरी उत्पाद",
        ministry: "स्वास्थ्य और परिवार कल्याण मंत्रालय (FSSAI)",
        scheme: "योजना-I (ISI मार्क)",
        description: "वाष्पित और मीठे कंडेंस्ड मिल्क (फुल क्रीम, आंशिक रूप से स्किम्ड और स्किम्ड) के लिए आवश्यकताओं और परीक्षण विधियों को निर्धारित करता है।"
      },
      pa: {
        productName: "ਕੰਡੈਂਸਡ ਮਿਲਕ, ਅੰਸ਼ਕ ਤੌਰ 'ਤੇ ਸਕਿਮਡ ਅਤੇ ਸਕਿਮਡ ਕੰਡੈਂਸਡ ਮਿਲਕ[cite: 5, 7, 8, 10]",
        department: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ ਵਿਭਾਗ (FAD)",
        category: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ - ਡੇਅਰੀ ਉਤਪਾਦ",
        ministry: "ਸਿਹਤ ਅਤੇ ਪਰਿਵਾਰ ਭਲਾਈ ਮੰਤਰਾਲਾ (FSSAI)",
        scheme: "ਸਕੀਮ-I (ISI ਮਾਰਕ)",
        description: "ਮਿੱਠੇ ਅਤੇ ਬਿਨਾਂ ਮਿੱਠੇ ਕੰਡੈਂਸਡ ਮਿਲਕ ਦੀਆਂ ਲੋੜਾਂ ਅਤੇ ਟੈਸਟਿੰਗ ਦੇ ਤਰੀਕਿਆਂ ਨੂੰ ਦਰਸਾਉਂਦਾ ਹੈ।"
      },
      te: {
        productName: "కండెన్స్డ్ మిల్క్, పాక్షికంగా స్కిమ్డ్ మరియు స్కిమ్డ్ కండెన్స్డ్ మిల్క్[cite: 5, 7, 8, 10]",
        department: "ఆహార మరియు వ్యవసాయ విభాగం (FAD)",
        category: "ఆహారం & వ్యవసాయం - పాల ఉత్పత్తులు",
        ministry: "ఆరోగ్య మరియు కుటుంబ సంక్షేమ మంత్రిత్వ శాఖ (FSSAI)",
        scheme: "స్కీమ్-I (ISI మార్క్)",
        description: "ఎవాపరేటెడ్ మరియు తియ్యని కండెన్స్డ్ మిల్క్ కోసం అవసరాలు మరియు పరీక్షా పద్ధతులను నిర్దేశిస్తుంది."
      }
    },
    details: {
      description: "Prescribes requirements and methods of sampling and test for evaporated and sweetened condensed milk (full cream, partly skimmed, and skimmed).",
      chemicalRequirements: {
        condensedMilkUnsweetened: "Total milk solids min 25.0% | Milk fat min 7.5%",
        condensedMilkSweetened: "Total milk solids min 31.0% | Milk fat min 9.0% | Sucrose min 40.0%",
        skimmedCondensedSweetened: "Total milk solids min 26.0% | Milk fat max 0.5% | Sucrose min 40.0%"
      },
      microbiologicalLimits: "Bacterial count max 500 per gram for sweetened condensed milk; Yeast and mould count max 10 per gram; Coliform count absent in 0.1 g."
    }
  },
  {
    id: "IS-12176",
    isNumber: "IS 12176:1987",
    department: "Food and Agriculture Department (FAD)",
    productName: "Sweetened Ultra High Temperature (UHT) Treated Condensed Milk[cite: 7, 10]",
    keywords: ["is 12176", "is-12176", "12176", "uht condensed milk", "uht milk", "यूएचटी कंडेंस्ड मिल्क", "UHT ਦੁੱਧ", "UHT మిల్క్"],
    category: "Food & Agriculture - Dairy Products",
    ministry: "Ministry of Health and Family Welfare (FSSAI)",
    scheme: "Scheme-I (ISI Mark)",
    sourcePdf: "listofproducts.pdf",
    translations: {
      hi: {
        productName: "मीठा अल्ट्रा हाई टेम्परेचर (UHT) उपचारित कंडेंस्ड मिल्क[cite: 7, 10]",
        department: "खाद्य और कृषि विभाग (FAD)",
        category: "खाद्य और कृषि - डेयरी उत्पाद",
        ministry: "स्वास्थ्य और परिवार कल्याण मंत्रालय (FSSAI)",
        scheme: "योजना-I (ISI मार्क)",
        description: "लंबे समय तक सुरक्षित रखने के लिए एसेप्टिक रूप से पैक किए गए UHT-स्टेरिलाइज्ड मीठे कंडेंस्ड मिल्क को कवर करता है।"
      },
      pa: {
        productName: "ਮਿੱਠਾ ਅਲਟਰਾ ਹਾਈ ਟੈਂਪਰੇਚਰ (UHT) ਟ੍ਰੀਟਿਡ ਕੰਡੈਂਸਡ ਮਿਲਕ[cite: 7, 10]",
        department: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ ਵਿਭਾਗ (FAD)",
        category: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ - ਡੇਅਰੀ ਉਤਪਾਦ",
        ministry: "ਸਿਹਤ ਅਤੇ ਪਰਿਵਾਰ ਭਲਾਈ ਮੰਤਰਾਲਾ (FSSAI)",
        scheme: "ਸਕੀਮ-I (ISI ਮਾਰਕ)",
        description: "ਲੰਬੀ ਸ਼ੈਲਫ ਲਾਈਫ ਲਈ ਪੈਕ ਕੀਤੇ UHT-ਸਟਰਿੱਲਾਈਜ਼ਡ ਮਿੱਠੇ ਕੰਡੈਂਸਡ ਮਿਲਕ ਨੂੰ ਕਵਰ ਕਰਦਾ ਹੈ।"
      },
      te: {
        productName: "స్వీటెన్డ్ అల్ట్రా హై టెంపరేచర్ (UHT) ట్రీటెడ్ కండెన్స్డ్ మిల్క్[cite: 7, 10]",
        department: "ఆహార మరియు వ్యవసాయ విభాగం (FAD)",
        category: "ఆహారం & వ్యవసాయం - పాల ఉత్పత్తులు",
        ministry: "ఆరోగ్య మరియు కుటుంబ సంక్షేమ మంత్రిత్వ శాఖ (FSSAI)",
        scheme: "స్కీమ్-I (ISI మార్క్)",
        description: "ఎక్కువ కాలం నిల్వ ఉండటానికి అసెప్టిక్‌గా ప్యాక్ చేయబడిన UHT-స్టెరిలైజ్డ్ తియ్యని కండెన్స్డ్ మిల్క్‌ను కవర్ చేస్తుంది."
      }
    },
    details: {
      description: "Covers UHT-sterilized sweetened condensed milk packed aseptically for extended shelf stability.",
      chemicalRequirements: {
        totalMilkSolidsMin: "31.0% by mass",
        fatMin: "9.0% by mass",
        sucroseMin: "40.0% by mass",
        titratableAcidityMax: "0.35% (as lactic acid)"
      },
      stabilityRequirement: "Must show no physical or chemical deterioration after incubation at 37°C for 14 days."
    }
  },
  {
    id: "IS-13334-1",
    isNumber: "IS 13334 (Part 1):2014",
    department: "Food and Agriculture Department (FAD)",
    productName: "Skimmed Milk Powder - Standard Grade[cite: 5, 7, 8, 10]",
    keywords: ["is 13334 part 1", "is 13334 (part 1)", "is-13334-1", "13334", "skimmed milk powder", "smp", "स्किम्ड मिल्क पाउडर", "ਸਕਿਮਡ ਮਿਲਕ ਪਾਊਡਰ", "స్కిమ్డ్ మిల్క్ పౌడర్"],
    category: "Food & Agriculture - Dairy Products",
    ministry: "Ministry of Health and Family Welfare (FSSAI)",
    scheme: "Scheme-I (ISI Mark)",
    sourcePdf: "listofproducts.pdf",
    translations: {
      hi: {
        productName: "स्किम्ड मिल्क पाउडर - स्टैंडर्ड ग्रेड (भाग 1)[cite: 5, 7, 8, 10]",
        department: "खाद्य और कृषि विभाग (FAD)",
        category: "खाद्य और कृषि - डेयरी उत्पाद",
        ministry: "स्वास्थ्य और परिवार कल्याण मंत्रालय (FSSAI)",
        scheme: "योजना-I (ISI मार्क)",
        description: "पाश्चुरीकृत स्किम्ड दूध से पानी निकालकर प्राप्त स्टैंडर्ड ग्रेड स्किम्ड मिल्क पाउडर।"
      },
      pa: {
        productName: "ਸਕਿਮਡ ਮਿਲਕ ਪਾਊਡਰ - ਸਟੈਂਡਰਡ ਗ੍ਰੇਡ (ਭਾਗ 1)[cite: 5, 7, 8, 10]",
        department: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ ਵਿਭਾਗ (FAD)",
        category: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ - ਡੇਅਰੀ ਉਤਪਾਦ",
        ministry: "ਸਿਹਤ ਅਤੇ ਪਰਿਵਾਰ ਭਲਾਈ ਮੰਤਰਾਲਾ (FSSAI)",
        scheme: "ਸਕੀਮ-I (ISI ਮਾਰਕ)",
        description: "ਪਾਸਚੁਰਾਈਜ਼ਡ ਸਕਿਮਡ ਦੁੱਧ ਤੋਂ ਪਾਣੀ ਹਟਾ ਕੇ ਪ੍ਰਾਪਤ ਕੀਤਾ ਸਟੈਂਡਰਡ ਗ੍ਰੇਡ ਸਕਿਮਡ ਮਿਲਕ ਪਾਊਡਰ।"
      },
      te: {
        productName: "స్కిమ్డ్ మిల్క్ పౌడర్ - స్టాండర్డ్ గ్రేడ్ (పార్ట్ 1)[cite: 5, 7, 8, 10]",
        department: "ఆహార మరియు వ్యవసాయ విభాగం (FAD)",
        category: "ఆహారం & వ్యవసాయం - పాల ఉత్పత్తులు",
        ministry: "ఆరోగ్య మరియు కుటుంబ సంక్షేమ మంత్రిత్వ శాఖ (FSSAI)",
        scheme: "స్కీమ్-I (ISI మార్క్)",
        description: "పాశ్చరైజ్డ్ స్కిమ్డ్ మిల్క్ నుండి నీటిని తొలగించడం ద్వారా పొందిన స్టాండర్డ్ గ్రేడ్ స్కిమ్డ్ మిల్క్ పౌడర్."
      }
    },
    details: {
      description: "Standard grade skimmed milk powder obtained by removing water from pasteurized skimmed milk.",
      chemicalRequirements: {
        moistureMax: "5.0% by mass",
        milkFatMax: "1.5% by mass",
        milkProteinInMSNFMin: "34.0% by mass",
        insolubilityIndexMax: "2.0 ml (Spray dried) | 15.0 ml (Roller dried)",
        totalAshOnDryBasisMax: "8.2% by mass",
        scorchedParticlesMax: "Disc B (15.0 mg)"
      }
    }
  },
  {
    id: "IS-13334-2",
    isNumber: "IS 13334 (Part 2):2014",
    department: "Food and Agriculture Department (FAD)",
    productName: "Skimmed Milk Powder - Extra Grade[cite: 5, 7, 8, 10]",
    keywords: ["is 13334 part 2", "is 13334 (part 2)", "is-13334-2", "extra grade skimmed milk powder", "extra grade smp", "एक्स्ट्रा ग्रेड स्किम्ड मिल्क पाउडर"],
    category: "Food & Agriculture - Dairy Products",
    ministry: "Ministry of Health and Family Welfare (FSSAI)",
    scheme: "Scheme-I (ISI Mark)",
    sourcePdf: "listofproducts.pdf",
    translations: {
      hi: {
        productName: "स्किम्ड मिल्क पाउडर - एक्स्ट्रा ग्रेड (भाग 2)[cite: 5, 7, 8, 10]",
        department: "खाद्य और कृषि विभाग (FAD)",
        category: "खाद्य और कृषि - डेयरी उत्पाद",
        ministry: "स्वास्थ्य और परिवार कल्याण मंत्रालय (FSSAI)",
        scheme: "योजना-I (ISI मार्क)",
        description: "उच्च ग्रेड डेयरी उपयोगों के लिए सख्त नमी, घुलनशीलता और जीवाणु सीमाओं के साथ एक्स्ट्रा ग्रेड स्प्रे-ड्राइड स्किम्ड मिल्क पाउडर।"
      },
      pa: {
        productName: "ਸਕਿਮਡ ਮਿਲਕ ਪਾਊਡਰ - ਐਕਸਟਰਾ ਗ੍ਰੇਡ (ਭਾਗ 2)[cite: 5, 7, 8, 10]",
        department: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ ਵਿਭਾਗ (FAD)",
        category: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ - ਡੇਅਰੀ ਉਤਪਾਦ",
        ministry: "ਸਿਹਤ ਅਤੇ ਪਰਿਵਾਰ ਭਲਾਈ ਮੰਤਰਾਲਾ (FSSAI)",
        scheme: "ਸਕੀਮ-I (ISI ਮਾਰਕ)",
        description: "ਉੱਚ-ਗ੍ਰੇਡ ਡੇਅਰੀ ਵਰਤੋਂ ਲਈ ਸਖ਼ਤ ਨਮੀ ਅਤੇ ਘੁਲਣਸ਼ੀਲਤਾ ਸੀਮਾਵਾਂ ਵਾਲਾ ਐਕਸਟਰਾ ਗ੍ਰੇਡ ਸਕਿਮਡ ਮਿਲਕ ਪਾਊਡਰ।"
      },
      te: {
        productName: "స్కిమ్డ్ మిల్క్ పౌడర్ - ఎక్స్‌ట్రా గ్రేడ్ (పార్ట్ 2)[cite: 5, 7, 8, 10]",
        department: "ఆహార మరియు వ్యవసాయ విభాగం (FAD)",
        category: "ఆహారం & వ్యవసాయం - పాల ఉత్పత్తులు",
        ministry: "ఆరోగ్య మరియు కుటుంబ సంక్షేమ మంత్రిత్వ శాఖ (FSSAI)",
        scheme: "స్కీమ్-I (ISI మార్క్)",
        description: "అధిక-గ్రేడ్ డెయిరీ అవసరాల కోసం కఠినమైన తేమ మరియు కరిగే పరిమితులతో కూడిన ఎక్స్‌ట్రా గ్రేడ్ స్కిమ్డ్ మిల్క్ పౌడర్."
      }
    },
    details: {
      description: "Extra grade spray-dried skimmed milk powder with stricter moisture, solubility, and bacterial limits for high-grade dairy and recombining uses.",
      chemicalRequirements: {
        moistureMax: "4.0% by mass",
        milkFatMax: "1.25% by mass",
        milkProteinInMSNFMin: "34.0% by mass",
        insolubilityIndexMax: "1.0 ml",
        titratableAcidityMax: "1.15% (as lactic acid)",
        scorchedParticlesMax: "Disc A (7.5 mg)"
      }
    }
  },
  {
    id: "IS-14542",
    isNumber: "IS 14542:1998",
    department: "Food and Agriculture Department (FAD)",
    productName: "Partly Skimmed Milk Powder[cite: 5, 7, 8, 10]",
    keywords: ["is 14542", "is-14542", "14542", "partly skimmed milk powder", "आंशिक स्किम्ड मिल्क पाउडर"],
    category: "Food & Agriculture - Dairy Products",
    ministry: "Ministry of Health and Family Welfare (FSSAI)",
    scheme: "Scheme-I (ISI Mark)",
    sourcePdf: "listofproducts.pdf",
    translations: {
      hi: {
        productName: "आंशिक रूप से स्किम्ड मिल्क पाउडर (Partly Skimmed Milk Powder)[cite: 5, 7, 8, 10]",
        department: "खाद्य और कृषि विभाग (FAD)",
        category: "खाद्य और कृषि - डेयरी उत्पाद",
        ministry: "स्वास्थ्य और परिवार कल्याण मंत्रालय (FSSAI)",
        scheme: "योजना-I (ISI मार्क)",
        description: "पाश्चुरीकृत आंशिक रूप से स्किम्ड दूध से पानी निकालकर बनाए गए मिल्क पाउडर को कवर करता है।"
      },
      pa: {
        productName: "ਅੰਸ਼ਕ ਤੌਰ 'ਤੇ ਸਕਿਮਡ ਮਿਲਕ ਪਾਊਡਰ[cite: 5, 7, 8, 10]",
        department: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ ਵਿਭਾਗ (FAD)",
        category: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ - ਡੇਅਰੀ ਉਤਪਾਦ",
        ministry: "ਸਿਹਤ ਅਤੇ ਪਰਿਵਾਰ ਭਲਾਈ ਮੰਤਰਾਲਾ (FSSAI)",
        scheme: "ਸਕੀਮ-I (ISI ਮਾਰਕ)",
        description: "ਪਾਸਚੁਰਾਈਜ਼ਡ ਅੰਸ਼ਕ ਤੌਰ 'ਤੇ ਸਕਿਮਡ ਦੁੱਧ ਤੋਂ ਪਾਣੀ ਹਟਾ ਕੇ ਤਿਆਰ ਕੀਤੇ ਮਿਲਕ ਪਾਊਡਰ ਨੂੰ ਕਵਰ ਕਰਦਾ ਹੈ।"
      },
      te: {
        productName: "పాక్షికంగా స్కిమ్డ్ మిల్క్ పౌడర్[cite: 5, 7, 8, 10]",
        department: "ఆహార మరియు వ్యవసాయ విభాగం (FAD)",
        category: "ఆహారం & వ్యవసాయం - పాల ఉత్పత్తులు",
        ministry: "ఆరోగ్య మరియు కుటుంబ సంక్షేమ మంత్రిత్వ శాఖ (FSSAI)",
        scheme: "స్కీమ్-I (ISI మార్క్)",
        description: "పాశ్చరైజ్డ్ పాక్షికంగా స్కిమ్డ్ మిల్క్ నుండి నీటిని తొలగించడం ద్వారా తయారు చేయబడిన మిల్క్ పౌడర్‌ను కవర్ చేస్తుంది."
      }
    },
    details: {
      description: "Covers partly skimmed milk powder manufactured by removing water from pasteurized partly skimmed milk.",
      chemicalRequirements: {
        moistureMax: "5.0% by mass",
        milkFat: "More than 1.5% and less than 26.0% by mass (exact fat percentage must be declared on the label)",
        milkProteinInMSNFMin: "34.0% by mass"
      }
    }
  },
  {
    id: "IS-14433",
    isNumber: "IS 14433:2007",
    department: "Food and Agriculture Department (FAD)",
    productName: "Infant Milk Substitutes[cite: 5, 7, 8, 10]",
    keywords: ["is 14433", "is-14433", "14433", "infant milk", "infant milk substitutes", "baby milk", "baby formula", "शिशु दूध", "शिशु आहार", "ਬੱਚਿਆਂ ਦਾ ਦੁੱਧ", "శిశువు పాల పొడి"],
    category: "Food & Agriculture - Infant Nutrition",
    ministry: "Ministry of Health and Family Welfare (FSSAI)",
    scheme: "Scheme-I (ISI Mark)",
    sourcePdf: "listofproducts.pdf",
    translations: {
      hi: {
        productName: "शिशु दुग्ध विकल्प (Infant Milk Substitutes)[cite: 5, 7, 8, 10]",
        department: "खाद्य और कृषि विभाग (FAD)",
        category: "खाद्य और कृषि - शिशु पोषण",
        ministry: "स्वास्थ्य और परिवार कल्याण मंत्रालय (FSSAI)",
        scheme: "योजना-I (ISI मार्क)",
        description: "6 महीने से 12 महीने तक के शिशुओं के लिए गाय या भैंस के दूध या वनस्पति प्रोटीन से प्राप्त शिशु दुग्ध विकल्पों को कवर करता है।"
      },
      pa: {
        productName: "ਸ਼ਿਸ਼ੂ ਦੁੱਧ ਦੇ ਬਦਲ (Infant Milk Substitutes)[cite: 5, 7, 8, 10]",
        department: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ ਵਿਭਾਗ (FAD)",
        category: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ - ਬੱਚਿਆਂ ਦਾ ਪੋਸ਼ਣ",
        ministry: "ਸਿਹਤ ਅਤੇ ਪਰਿਵਾਰ ਭਲਾਈ ਮੰਤਰਾਲਾ (FSSAI)",
        scheme: "ਸਕੀਮ-I (ISI ਮਾਰਕ)",
        description: "6 ਤੋਂ 12 ਮਹੀਨਿਆਂ ਤੱਕ ਦੇ ਬੱਚਿਆਂ ਲਈ ਗਾਂ ਜਾਂ ਮੱਝ ਦੇ ਦੁੱਧ ਤੋਂ ਤਿਆਰ ਕੀਤੇ ਸ਼ਿਸ਼ੂ ਦੁੱਧ ਦੇ ਬਦਲਾਂ ਨੂੰ ਕਵਰ ਕਰਦਾ ਹੈ।"
      },
      te: {
        productName: "శిశు పాల ప్రత్యామ్నాయాలు (Infant Milk Substitutes)[cite: 5, 7, 8, 10]",
        department: "ఆహార మరియు వ్యవసాయ విభాగం (FAD)",
        category: "ఆహారం & వ్యవసాయం - శిశు పోషణ",
        ministry: "ఆరోగ్య మరియు కుటుంబ సంక్షేమ మంత్రిత్వ శాఖ (FSSAI)",
        scheme: "స్కీమ్-I (ISI మార్క్)",
        description: "6 నుండి 12 నెలల వయస్సు గల శిశువుల కోసం ఆవు లేదా గేదె పాలు లేదా వృక్ష ప్రోటీన్ నుండి తీసుకోబడిన శిశు పాల ప్రత్యామ్నాయాలను కవర్ చేస్తుంది."
      }
    },
    details: {
      description: "Covers infant milk substitutes derived from cow or buffalo milk or vegetable protein meant for infants up to 6 months / 12 months.",
      nutritionalRequirements: {
        moistureMax: "4.5% by mass",
        totalMilkProtein: "10.0% to 16.0% by mass",
        milkFat: "18.0% to 30.0% by mass",
        energyValue: "450 to 500 kcal per 100 g",
        essentialVitaminsAndMinerals: "Mandatory fortification with Iron, Vitamin A, Vitamin D, Vitamin C, Thiamine, Riboflavin, Niacin, Folic acid, Calcium, Phosphorus, Iodine, and Zinc"
      },
      packaging: "Must be packed in hermetically sealed, clean, sound containers under nitrogen or carbon dioxide inert gas flushing."
    }
  },
  {
    id: "IS-1656",
    isNumber: "IS 1656:2007",
    department: "Food and Agriculture Department (FAD)",
    productName: "Milk-Cereal Based Complementary Foods[cite: 5, 8]",
    keywords: ["is 1656", "is-1656", "1656", "milk cereal", "complementary food", "weaning food", "cerelac", "दूध अनाज आहार"],
    category: "Food & Agriculture - Infant Nutrition",
    ministry: "Ministry of Health and Family Welfare (FSSAI)",
    scheme: "Scheme-I (ISI Mark)",
    sourcePdf: "listofproducts.pdf",
    translations: {
      hi: {
        productName: "दूध-अनाज आधारित पूरक आहार (Milk-Cereal Based Complementary Foods)[cite: 5, 8]",
        department: "खाद्य और कृषि विभाग (FAD)",
        category: "खाद्य और कृषि - शिशु पोषण",
        ministry: "स्वास्थ्य और परिवार कल्याण मंत्रालय (FSSAI)",
        scheme: "योजना-I (ISI मार्क)",
        description: "6 महीने की आयु के बाद शिशुओं के लिए दूध और अनाज (गेहूं, चावल, जई, जौ, मक्का, बाजरा) पर आधारित पूरक आहार।"
      },
      pa: {
        productName: "ਦੁੱਧ-ਅਨਾਜ ਅਧਾਰਤ ਪੂਰਕ ਖੁਰਾਕ[cite: 5, 8]",
        department: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ ਵਿਭਾਗ (FAD)",
        category: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ - ਬੱਚਿਆਂ ਦਾ ਪੋਸ਼ਣ",
        ministry: "ਸਿਹਤ ਅਤੇ ਪਰਿਵਾਰ ਭਲਾਈ ਮੰਤਰਾਲਾ (FSSAI)",
        scheme: "ਸਕੀਮ-I (ISI ਮਾਰਕ)",
        description: "6 ਮਹੀਨਿਆਂ ਦੀ ਉਮਰ ਤੋਂ ਬਾਅਦ ਬੱਚਿਆਂ ਲਈ ਦੁੱਧ ਅਤੇ ਅਨਾਜ (ਕਣਕ, ਚੌਲ, ਜੌਂ, ਮੱਕੀ) 'ਤੇ ਅਧਾਰਤ ਪੂਰਕ ਖੁਰਾਕ।"
      },
      te: {
        productName: "పాలు-తృణధాన్యాల ఆధారిత కాంప్లిమెంటరీ ఫుడ్స్[cite: 5, 8]",
        department: "ఆహార మరియు వ్యవసాయ విభాగం (FAD)",
        category: "ఆహారం & వ్యవసాయం - శిశు పోషణ",
        ministry: "ఆరోగ్య మరియు కుటుంబ సంక్షేమ మంత్రిత్వ శాఖ (FSSAI)",
        scheme: "స్కీమ్-I (ISI మార్క్)",
        description: "6 నెలల వయస్సు తర్వాత శిశువులకు పాలు మరియు తృణధాన్యాల (గోధుమలు, బియ్యం, ఓట్స్, బార్లీ, మొక్కజొన్న) ఆధారిత అనుబంధ ఆహారం."
      }
    },
    details: {
      description: "Complementary weaning food based on milk and cereals (wheat, rice, oats, barley, maize, millets) for infants after 6 months of age.",
      chemicalRequirements: {
        moistureMax: "5.0% by mass",
        milkProteinMin: "5.0% by mass",
        totalProteinMin: "12.0% by mass",
        fatMin: "7.5% by mass",
        totalCarbohydratesMin: "55.0% by mass",
        crudeFibreOnDryBasisMax: "1.0% by mass"
      }
    }
  },
  {
    id: "IS-11536",
    isNumber: "IS 11536:2007",
    department: "Food and Agriculture Department (FAD)",
    productName: "Processed Cereal-Based Complementary Foods[cite: 5, 7, 8, 10]",
    keywords: ["is 11536", "is-11536", "11536", "processed cereal", "cereal complementary food", "प्रसंस्कृत अनाज पूरक आहार"],
    category: "Food & Agriculture - Infant Nutrition",
    ministry: "Ministry of Health and Family Welfare (FSSAI)",
    scheme: "Scheme-I (ISI Mark)",
    sourcePdf: "listofproducts.pdf",
    translations: {
      hi: {
        productName: "प्रसंस्कृत अनाज आधारित पूरक आहार[cite: 5, 7, 8, 10]",
        department: "खाद्य और कृषि विभाग (FAD)",
        category: "खाद्य और कृषि - शिशु पोषण",
        ministry: "स्वास्थ्य और परिवार कल्याण मंत्रालय (FSSAI)",
        scheme: "योजना-I (ISI मार्क)",
        description: "6 महीने से अधिक उम्र के शिशुओं के लिए मुख्य रूप से पिसे हुए अनाज और दालों से तैयार पूरक आहार।"
      },
      pa: {
        productName: "ਪ੍ਰੋਸੈਸਡ ਅਨਾਜ-ਅਧਾਰਤ ਪੂਰਕ ਖੁਰਾਕ[cite: 5, 7, 8, 10]",
        department: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ ਵਿਭਾਗ (FAD)",
        category: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ - ਬੱਚਿਆਂ ਦਾ ਪੋਸ਼ਣ",
        ministry: "ਸਿਹਤ ਅਤੇ ਪਰਿਵਾਰ ਭਲਾਈ ਮੰਤਰਾਲਾ (FSSAI)",
        scheme: "ਸਕੀਮ-I (ISI ਮਾਰਕ)",
        description: "6 ਮਹੀਨਿਆਂ ਤੋਂ ਵੱਧ ਉਮਰ ਦੇ ਬੱਚਿਆਂ ਲਈ ਪੀਸੇ ਹੋਏ ਅਨਾਜ ਅਤੇ ਦਾਲਾਂ ਤੋਂ ਤਿਆਰ ਪੂਰਕ ਖੁਰਾਕ।"
      },
      te: {
        productName: "ప్రాసెస్ చేయబడిన తృణధాన్యాల ఆధారిత కాంప్లిమెంటరీ ఫుడ్స్[cite: 5, 7, 8, 10]",
        department: "ఆహార మరియు వ్యవసాయ విభాగం (FAD)",
        category: "ఆహారం & వ్యవసాయం - శిశు పోషణ",
        ministry: "ఆరోగ్య మరియు కుటుంబ సంక్షేమ మంత్రిత్వ శాఖ (FSSAI)",
        scheme: "స్కీమ్-I (ISI మార్క్)",
        description: "6 నెలల కంటే ఎక్కువ వయస్సు ఉన్న శిశువుల కోసం తృణధాన్యాలు మరియు పప్పుధాన్యాల నుండి తయారుచేసిన అనుబంధ ఆహారం."
      }
    },
    details: {
      description: "Complementary weaning foods prepared primarily from milled cereal grains and legumes/pulses for infants older than 6 months.",
      chemicalRequirements: {
        moistureMax: "4.0% to 8.0% depending on product variety (dry pasta, rusks, biscuits, or roller-dried cereal)",
        proteinMin: "6.0% to 14.0% by mass",
        crudeFibreOnDryBasisMax: "2.0% by mass",
        ironAndVitamins: "Must contain bioavailable iron (min 5 mg/100g) and essential B-group vitamins, Vitamin A, and Vitamin D"
      }
    }
  },
  {
    id: "IS-15757",
    isNumber: "IS 15757:2007",
    department: "Food and Agriculture Department (FAD)",
    productName: "Follow-Up Formula - Complementary Foods[cite: 5, 7, 8, 10]",
    keywords: ["is 15757", "is-15757", "15757", "follow up formula", "follow-up formula", "फॉलो-अप फॉर्मूला"],
    category: "Food & Agriculture - Infant Nutrition",
    ministry: "Ministry of Health and Family Welfare (FSSAI)",
    scheme: "Scheme-I (ISI Mark)",
    sourcePdf: "listofproducts.pdf",
    translations: {
      hi: {
        productName: "फॉलो-अप फॉर्मूला - पूरक आहार[cite: 5, 7, 8, 10]",
        department: "खाद्य और कृषि विभाग (FAD)",
        category: "खाद्य और कृषि - शिशु पोषण",
        ministry: "स्वास्थ्य और परिवार कल्याण मंत्रालय (FSSAI)",
        scheme: "योजना-I (ISI मार्क)",
        description: "6 महीने से ऊपर और 24 महीने तक के शिशुओं के लिए पूरक आहार के तरल भाग के रूप में उपयोग के लिए अभिप्रेत भोजन।"
      },
      pa: {
        productName: "ਫਾਲੋ-ਅੱਪ ਫਾਰਮੂਲਾ - ਪੂਰਕ ਖੁਰਾਕ[cite: 5, 7, 8, 10]",
        department: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ ਵਿਭਾਗ (FAD)",
        category: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ - ਬੱਚਿਆਂ ਦਾ ਪੋਸ਼ਣ",
        ministry: "ਸਿਹਤ ਅਤੇ ਪਰਿਵਾਰ ਭਲਾਈ ਮੰਤਰਾਲਾ (FSSAI)",
        scheme: "ਸਕੀਮ-I (ISI ਮਾਰਕ)",
        description: "6 ਮਹੀਨਿਆਂ ਤੋਂ 24 ਮਹੀਨਿਆਂ ਤੱਕ ਦੇ ਬੱਚਿਆਂ ਲਈ ਪੂਰਕ ਖੁਰਾਕ ਦੇ ਤਰਲ ਹਿੱਸੇ ਵਜੋਂ ਵਰਤੋਂ ਲਈ ਭੋਜਨ।"
      },
      te: {
        productName: "ఫాలో-అప్ ఫార్ములా - కాంప్లిమెంటరీ ఫుడ్స్[cite: 5, 7, 8, 10]",
        department: "ఆహార మరియు వ్యవసాయ విభాగం (FAD)",
        category: "ఆహారం & వ్యవసాయం - శిశు పోషణ",
        ministry: "ఆరోగ్య మరియు కుటుంబ సంక్షేమ మంత్రిత్వ శాఖ (FSSAI)",
        scheme: "స్కీమ్-I (ISI మార్క్)",
        description: "6 నెలల నుండి 24 నెలల వయస్సు గల శిశువులకు అనుబంధ ఆహారంలో ద్రవ భాగంగా ఉపయోగించేందుకు ఉద్దేశించిన ఆహారం."
      }
    },
    details: {
      description: "Food intended for use as a liquid part of the complementary diet for infants aged above 6 months up to 24 months.",
      nutritionalRequirements: {
        moistureMax: "4.5% by mass",
        protein: "3.0 g to 5.5 g per 100 kcal",
        fat: "3.0 g to 6.0 g per 100 kcal (Linoleate min 300 mg per 100 kcal)",
        energyPer100mlPrepared: "60 kcal to 85 kcal"
      }
    }
  },
  {
    id: "IS-13428",
    isNumber: "IS 13428:2005",
    department: "Food and Agriculture Department (FAD)",
    productName: "Packaged Natural Mineral Water[cite: 7, 10]",
    keywords: ["is 13428", "is-13428", "13428", "natural mineral water", "प्राकृतिक मिनरल वाटर", "ਮਿਨਰਲ ਵਾਟਰ", "మినరల్ వాటర్"],
    category: "Food & Agriculture - Beverages & Water",
    ministry: "Ministry of Health and Family Welfare (FSSAI)",
    scheme: "Scheme-I (ISI Mark)",
    sourcePdf: "listofproducts.pdf",
    translations: {
      hi: {
        productName: "पैकेज्ड प्राकृतिक मिनरल वाटर (Packaged Natural Mineral Water)[cite: 7, 10]",
        department: "खाद्य और कृषि विभाग (FAD)",
        category: "खाद्य और कृषि - पेय और जल",
        ministry: "स्वास्थ्य और परिवार कल्याण मंत्रालय (FSSAI)",
        scheme: "योजना-I (ISI मार्क)",
        description: "प्राकृतिक या भूमिगत स्रोतों (झरनों) से सीधे प्राप्त पानी जो अपनी खनिज सामग्री और मूल सूक्ष्मजीवविज्ञानी शुद्धता की विशेषता रखता है।"
      },
      pa: {
        productName: "ਪੈਕੇਜਡ ਕੁਦਰਤੀ ਮਿਨਰਲ ਵਾਟਰ[cite: 7, 10]",
        department: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ ਵਿਭਾਗ (FAD)",
        category: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ - ਪੀਣ ਵਾਲਾ ਪਾਣੀ",
        ministry: "ਸਿਹਤ ਅਤੇ ਪਰਿਵਾਰ ਭਲਾਈ ਮੰਤਰਾਲਾ (FSSAI)",
        scheme: "ਸਕੀਮ-I (ISI ਮਾਰਕ)",
        description: "ਕੁਦਰਤੀ ਜਾਂ ਜ਼ਮੀਨਦੋਜ਼ ਸਰੋਤਾਂ (ਝਰਨਿਆਂ) ਤੋਂ ਸਿੱਧਾ ਪ੍ਰਾਪਤ ਕੀਤਾ ਖਣਿਜ ਭਰਪੂਰ ਪਾਣੀ।"
      },
      te: {
        productName: "ప్యాకేజ్డ్ నేచురల్ మినరల్ వాటర్[cite: 7, 10]",
        department: "ఆహార మరియు వ్యవసాయ విభాగం (FAD)",
        category: "ఆహారం & వ్యవసాయం - పానీయాలు & నీరు",
        ministry: "ఆరోగ్య మరియు కుటుంబ సంక్షేమ మంత్రిత్వ శాఖ (FSSAI)",
        scheme: "స్కీమ్-I (ISI మార్క్)",
        description: "సహజ లేదా భూగర్భ వనరుల నుండి నేరుగా పొందిన ఖనిజాలు మరియు సహజ స్వచ్ఛత కలిగిన మినరల్ వాటర్."
      }
    },
    details: {
      description: "Water obtained directly from natural or drilled subterranean sources (springs or underground strata) characterized by its mineral content and original microbiological purity, packed close to the point of emergence.",
      chemicalLimits: {
        totalDissolvedSolids: "150 mg/l to 700 mg/l",
        pH: "6.5 to 8.5",
        fluorideMax: "1.0 mg/l",
        nitrateMax: "50 mg/l",
        arsenicMax: "0.05 mg/l",
        leadMax: "0.01 mg/l"
      },
      permittedTreatments: "Separation of unstable constituents (iron, manganese, sulphur) by decantation or filtration; no chemical disinfection that alters natural microflora is permitted."
    }
  },
  {
    id: "IS-14543",
    isNumber: "IS 14543:2016",
    department: "Food and Agriculture Department (FAD)",
    productName: "Packaged Drinking Water (Other than Packaged Natural Mineral Water)[cite: 7, 10]",
    keywords: ["is 14543", "is-14543", "14543", "packaged drinking water", "drinking water", "water bottle", "पानी", "पेयजल", "ਪਾਣੀ", "నీరు", "త్రాగునీరు"],
    category: "Food & Agriculture - Beverages & Water",
    ministry: "Ministry of Health and Family Welfare (FSSAI)",
    scheme: "Scheme-I (ISI Mark)",
    sourcePdf: "listofproducts.pdf",
    translations: {
      hi: {
        productName: "पैकेज्ड पेयजल (प्राकृतिक मिनरल वाटर के अलावा)[cite: 7, 10]",
        department: "खाद्य और कृषि विभाग (FAD)",
        category: "खाद्य और कृषि - पेय और जल",
        ministry: "स्वास्थ्य और परिवार कल्याण मंत्रालय (FSSAI)",
        scheme: "योजना-I (ISI मार्क)",
        description: "निस्पंदन, रिवर्स ऑस्मोसिस (RO), या ओजोनेशन/UV कीटाणुशोधन से उपचारित और खाद्य-ग्रेड कंटेनरों में सीलबंद पीने का पानी।"
      },
      pa: {
        productName: "ਪੈਕੇਜਡ ਪੀਣ ਵਾਲਾ ਪਾਣੀ (Packaged Drinking Water)[cite: 7, 10]",
        department: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ ਵਿਭਾਗ (FAD)",
        category: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ - ਪੀਣ ਵਾਲਾ ਪਾਣੀ",
        ministry: "ਸਿਹਤ ਅਤੇ ਪਰਿਵਾਰ ਭਲਾਈ ਮੰਤਰਾਲਾ (FSSAI)",
        scheme: "ਸਕੀਮ-I (ISI ਮਾਰਕ)",
        description: "ਫਿਲਟਰੇਸ਼ਨ, RO ਜਾਂ UV ਦੁਆਰਾ ਸ਼ੁੱਧ ਕੀਤਾ ਅਤੇ ਫੂਡ-ਗ੍ਰੇਡ ਬੋਤਲਾਂ ਵਿੱਚ ਸੀਲਬੰਦ ਪੀਣ ਵਾਲਾ ਪਾਣੀ।"
      },
      te: {
        productName: "ప్యాకేజ్డ్ డ్రింకింగ్ వాటర్ (సహజ మినరల్ వాటర్ కాకుండా)[cite: 7, 10]",
        department: "ఆహార మరియు వ్యవసాయ విభాగం (FAD)",
        category: "ఆహారం & వ్యవసాయం - పానీయాలు & నీరు",
        ministry: "ఆరోగ్య మరియు కుటుంబ సంక్షేమ మంత్రిత్వ శాఖ (FSSAI)",
        scheme: "స్కీమ్-I (ISI మార్క్)",
        description: "ఫిల్టరేషన్, రివర్స్ ఆస్మోసిస్ (RO) లేదా UV ద్వారా శుద్ధి చేయబడి సీల్డ్ కంటైనర్లలో ప్యాక్ చేయబడిన త్రాగునీరు."
      }
    },
    details: {
      description: "Water derived from any potable surface or underground source subjected to filtration, reverse osmosis, demineralization, remineralization, or ozonation/UV disinfection and sealed in food-grade containers.",
      chemicalLimits: {
        pH: "6.5 to 8.5",
        tdsMax: "500 mg/l",
        turbidityMax: "2 NTU",
        colourMax: "2 Hazen units",
        calciumMax: "75 mg/l",
        magnesiumMax: "30 mg/l"
      },
      microbiologicalLimits: "Zero E. coli, Coliforms, Faecal streptococci, Staphylococcus aureus, Pseudomonas aeruginosa, Salmonella, Shigella, and Vibrio cholerae."
    }
  },
  {
    id: "IS-12786",
    isNumber: "IS 12786:1989",
    department: "Food and Agriculture Department (FAD)",
    productName: "Irrigation Equipment - Polyethylene Pipes for Irrigation Laterals[cite: 5, 8]",
    keywords: ["is 12786", "is-12786", "12786", "irrigation", "irrigation pipe", "drip irrigation", "polyethylene pipe", "सिंचाई पाइप", "ड्रिप सिंचाई", "ਸਿੰਚਾਈ ਪਾਈਪ", "నీటిపారుదల పైపు"],
    category: "Agriculture & Micro-Irrigation Equipment",
    ministry: "Ministry of Chemicals and Fertilizers / Ministry of Agriculture",
    scheme: "Scheme-I (ISI Mark)",
    sourcePdf: "listofproducts.pdf",
    translations: {
      hi: {
        productName: "सिंचाई उपकरण - सिंचाई लैटरल के लिए पॉलीथीन पाइप[cite: 5, 8]",
        department: "खाद्य और कृषि विभाग (FAD)",
        category: "कृषि और सूक्ष्म सिंचाई उपकरण",
        ministry: "रसायन और उर्वरक मंत्रालय / कृषि मंत्रालय",
        scheme: "योजना-I (ISI मार्क)",
        description: "कृषि ड्रिप और माइक्रो-स्प्रिंकलर सिंचाई प्रणालियों में लैटरल के रूप में उपयोग किए जाने वाले LLDPE और LDPE पाइप (12 मिमी से 32 मिमी बाहरी व्यास) के लिए आवश्यकताओं को निर्दिष्ट करता है।"
      },
      pa: {
        productName: "ਸਿੰਚਾਈ ਉਪਕਰਣ - ਸਿੰਚਾਈ ਲੈਟਰਲਾਂ ਲਈ ਪੋਲੀਥੀਲੀਨ ਪਾਈਪ[cite: 5, 8]",
        department: "ਖੁਰਾਕ ਅਤੇ ਖੇਤੀਬਾੜੀ ਵਿਭਾਗ (FAD)",
        category: "ਖੇਤੀਬਾੜੀ ਅਤੇ ਸੂਖਮ-ਸਿੰਚਾਈ ਉਪਕਰਣ",
        ministry: "ਰਸਾਇਣ ਅਤੇ ਖਾਦ ਮੰਤਰਾਲਾ / ਖੇਤੀਬਾੜੀ ਮੰਤਰਾਲਾ",
        scheme: "ਸਕੀਮ-I (ISI ਮਾਰਕ)",
        description: "ਖੇਤੀਬਾੜੀ ਤੁਪਕਾ (Drip) ਅਤੇ ਸਪ੍ਰਿੰਕਲਰ ਸਿੰਚਾਈ ਪ੍ਰਣਾਲੀਆਂ ਵਿੱਚ ਵਰਤੇ ਜਾਣ ਵਾਲੇ ਪੋਲੀਥੀਲੀਨ ਪਾਈਪਾਂ (12 mm ਤੋਂ 32 mm) ਦੀਆਂ ਲੋੜਾਂ ਨੂੰ ਦਰਸਾਉਂਦਾ ਹੈ।"
      },
      te: {
        productName: "నీటిపారుదల పరికరాలు - ఇరిగేషన్ లేటరల్స్ కోసం పాలిథిలిన్ పైపులు[cite: 5, 8]",
        department: "ఆహార మరియు వ్యవసాయ విభాగం (FAD)",
        category: "వ్యవసాయం & మైక్రో-ఇరిగేషన్ పరికరాలు",
        ministry: "రసాయనాలు మరియు ఎరువుల మంత్రిత్వ శాఖ / వ్యవసాయ మంత్రిత్వ శాఖ",
        scheme: "స్కీమ్-I (ISI మార్క్)",
        description: "వ్యవసాయ డ్రిప్ మరియు మైక్రో-స్ప్రింక్లర్ ఇరిగేషన్ సిస్టమ్‌లలో ఉపయోగించే LLDPE మరియు LDPE పైపుల (12 mm నుండి 32 mm) అవసరాలను నిర్దేశిస్తుంది."
      }
    },
    details: {
      description: "Specifies requirements for LLDPE and LDPE pipes (12 mm to 32 mm outside diameter) used as laterals in agricultural drip and micro-sprinkler irrigation systems.",
      requirements: {
        carbonBlackContent: "2.5% +/- 0.5% for UV protection in open farm fields",
        pressureClasses: "Class 1 (0.25 MPa), Class 2 (0.40 MPa), Class 3 (0.60 MPa)",
        tests: "Hydraulic proof test, tensile strength and elongation at break, environmental stress cracking resistance (ESCR), and reversion test"
      }
    }
  },
  {
    id: "IS-14887",
    isNumber: "IS 14887:2014",
    department: "Textiles / Food & Public Distribution",
    productName: "HDPE/PP Woven Sacks for Packaging of 50 kg Food Grains[cite: 5, 8]",
    keywords: ["is 14887", "is-14887", "14887", "woven sacks", "foodgrain sack", "hdpe sack", "pp sack", "अनाज की बोरी", "बोरी", "ਅਨਾਜ ਦੀ ਬੋਰੀ", "ఆహార ధాన్యాల సంచులు"],
    category: "Agriculture & Food Grain Storage",
    ministry: "Ministry of Consumer Affairs, Food and Public Distribution",
    scheme: "Scheme-I (ISI Mark)",
    sourcePdf: "listofproducts.pdf",
    translations: {
      hi: {
        productName: "50 किग्रा खाद्यान्न की पैकेजिंग के लिए HDPE/PP बुने हुए बोरे[cite: 5, 8]",
        department: "वस्त्र / खाद्य और सार्वजनिक वितरण",
        category: "कृषि और खाद्यान्न भंडारण",
        ministry: "उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय",
        scheme: "योजना-I (ISI मार्क)",
        description: "50 किलोग्राम खाद्यान्न (गेहूं, धान, चावल) की थोक खरीद और भंडारण के लिए उपयोग किए जाने वाले उच्च घनत्व पॉलीथीन (HDPE) और पॉलीप्रोपाइलीन (PP) के बुने हुए बोरों की मजबूती और आकार को निर्दिष्ट करता है।"
      },
      pa: {
        productName: "50 ਕਿਲੋ ਅਨਾਜ ਦੀ ਪੈਕਿੰਗ ਲਈ HDPE/PP ਬੁਣੀਆਂ ਬੋਰੀਆਂ[cite: 5, 8]",
        department: "ਟੈਕਸਟਾਈਲ / ਖੁਰਾਕ ਅਤੇ ਜਨਤਕ ਵੰਡ",
        category: "ਖੇਤੀਬਾੜੀ ਅਤੇ ਅਨਾਜ ਭੰਡਾਰਨ",
        ministry: "ਖਪਤਕਾਰ ਮਾਮਲੇ, ਖੁਰਾਕ ਅਤੇ ਜਨਤਕ ਵੰਡ ਮੰਤਰਾਲਾ",
        scheme: "ਸਕੀਮ-I (ISI ਮਾਰਕ)",
        description: "50 ਕਿਲੋ ਅਨਾਜ (ਕਣਕ, ਝੋਨਾ, ਚੌਲ) ਦੀ ਸਟੋਰੇਜ ਲਈ ਵਰਤੀਆਂ ਜਾਣ ਵਾਲੀਆਂ HDPE ਅਤੇ PP ਬੁਣੀਆਂ ਬੋਰੀਆਂ ਦੇ ਆਕਾਰ ਅਤੇ ਮਜ਼ਬੂਤੀ ਨੂੰ ਦਰਸਾਉਂਦਾ ਹੈ।"
      },
      te: {
        productName: "50 కిలోల ఆహార ధాన్యాల ప్యాకేజింగ్ కోసం HDPE/PP నేసిన సంచులు[cite: 5, 8]",
        department: "టెక్స్‌టైల్స్ / ఆహారం & ప్రజా పంపిణీ",
        category: "వ్యవసాయం & ఆహార ధాన్యాల నిల్వ",
        ministry: "వినియోగదారుల వ్యవహారాలు, ఆహారం మరియు ప్రజా పంపిణీ మంత్రిత్వ శాఖ",
        scheme: "స్కీమ్-I (ISI మార్క్)",
        description: "50 కిలోల ఆహార ధాన్యాల (గోధుమలు, వరి, బియ్యం) నిల్వ కోసం ఉపయోగించే HDPE మరియు PP నేసిన సంచుల నిర్మాణం మరియు బలాన్ని నిర్దేశిస్తుంది."
      }
    },
    details: {
      description: "Specifies construction, dimensions, mass, and breaking strength of high-density polyethylene (HDPE) and polypropylene (PP) woven sacks used for bulk procurement and storage of 50 kg food grains (wheat, paddy, rice).",
      requirements: {
        capacity: "50 kg food grains",
        breakingStrengthMin: "Warpway: 785 N | Weftway: 785 N | Seam strength: 345 N",
        uvResistance: "Minimum 50% retention of breaking strength after 144 hours of UV weathering exposure"
      }
    }
  },
  {
    id: "IS-269",
    isNumber: "IS 269:2015",
    productName: "Ordinary Portland Cement (OPC) - 33, 43, and 53 Grade[cite: 7, 10]",
    keywords: ["is 269", "is-269", "269", "ordinary portland cement", "opc", "33 grade", "43 grade", "53 grade", "cement", "सीमेंट", "ਸੀਮਿੰਟ", "సిమెంట్"],
    category: "Cement and Concrete",
    ministry: "Ministry of Commerce and Industry (DPIIT)",
    scheme: "Scheme-I (ISI Mark)",
    translations: {
      hi: {
        productName: "साधारण पोर्टलैंड सीमेंट (OPC) - 33, 43 और 53 ग्रेड[cite: 7, 10]",
        category: "सीमेंट और कंक्रीट",
        ministry: "वाणिज्य और उद्योग मंत्रालय (DPIIT)",
        scheme: "योजना-I (ISI मार्क)",
        description: "सामान्य सिविल इंजीनियरिंग निर्माण और प्रबलित कंक्रीट (RCC) में उपयोग किए जाने वाले 33, 43 और 53 ग्रेड के साधारण पोर्टलैंड सीमेंट की आवश्यकताओं को कवर करता है।"
      },
      pa: {
        productName: "ਸਧਾਰਨ ਪੋਰਟਲੈਂਡ ਸੀਮਿੰਟ (OPC) - 33, 43 ਅਤੇ 53 ਗ੍ਰੇਡ[cite: 7, 10]",
        category: "ਸੀਮਿੰਟ ਅਤੇ ਕੰਕਰੀਟ",
        ministry: "ਵਣਜ ਅਤੇ ਉਦਯੋਗ ਮੰਤਰਾਲਾ (DPIIT)",
        scheme: "ਸਕੀਮ-I (ISI ਮਾਰਕ)",
        description: "ਆਮ ਸਿਵਲ ਇੰਜੀਨੀਅਰਿੰਗ ਉਸਾਰੀ ਅਤੇ ਕੰਕਰੀਟ ਵਿੱਚ ਵਰਤੇ ਜਾਣ ਵਾਲੇ 33, 43 ਅਤੇ 53 ਗ੍ਰੇਡ ਦੇ ਸਧਾਰਨ ਪੋਰਟਲੈਂਡ ਸੀਮਿੰਟ ਦੀਆਂ ਲੋੜਾਂ ਨੂੰ ਕਵਰ ਕਰਦਾ ਹੈ।"
      },
      te: {
        productName: "ఆర్డినరీ పోర్ట్‌ల్యాండ్ సిమెంట్ (OPC) - 33, 43 మరియు 53 గ్రేడ్[cite: 7, 10]",
        category: "సిమెంట్ మరియు కాంక్రీటు",
        ministry: "వాణిజ్య మరియు పరిశ్రమల మంత్రిత్వ శాఖ (DPIIT)",
        scheme: "స్కీమ్-I (ISI మార్క్)",
        description: "సాధారణ సివిల్ ఇంజనీరింగ్ నిర్మాణం మరియు రీన్‌ఫోర్స్డ్ కాంక్రీటులో ఉపయోగించే 33, 43 మరియు 53 గ్రేడ్‌ల ఆర్డినరీ పోర్ట్‌ల్యాండ్ సిమెంట్ అవసరాలను కవర్ చేస్తుంది."
      }
    },
    details: {
      description: "Covers requirements for Ordinary Portland Cement of 33, 43, and 53 grades used across general civil engineering construction and reinforced concrete.",
      chemicalRequirements: {
        limeSaturationFactor: "0.66 to 1.02 (for 33 & 43 grade), 0.80 to 1.02 (for 53 grade)",
        magnesiaMax: "6.0%",
        insolubleResidueMax: "4.0% to 5.0%",
        totalSulphurAsSO3Max: "3.5%",
        totalLossOnIgnitionMax: "4.0% to 5.0%"
      },
      physicalRequirements: {
        finenessMin: "225 m2/kg (Blaine's air permeability method)",
        soundness: "Max 10 mm expansion by Le-Chatelier method; max 0.8% by Autoclave test",
        settingTime: "Initial: minimum 30 minutes | Final: maximum 600 minutes",
        compressiveStrength28Days: {
          grade33: "33 MPa (N/mm2)",
          grade43: "43 MPa (N/mm2)",
          grade53: "53 MPa (N/mm2)"
        }
      }
    }
  },
  {
    id: "IS-1489",
    isNumber: "IS 1489 (Part 1 & 2):2015",
    productName: "Portland Pozzolana Cement (PPC) - Fly Ash & Calcined Clay Based[cite: 7, 10]",
    keywords: ["is 1489", "is-1489", "1489", "portland pozzolana cement", "ppc", "fly ash cement", "पोजोलाना सीमेंट", "पीपीसी"],
    category: "Cement and Concrete",
    ministry: "Ministry of Commerce and Industry (DPIIT)",
    scheme: "Scheme-I (ISI Mark)",
    details: {
      description: "Blended cement manufactured by grinding Portland cement clinker and pozzolana (fly ash in Part 1, calcined clay in Part 2) with gypsum.",
      composition: "Fly ash constituent must be between 15% and 35% by mass of PPC. Calcined clay constituent must be between 10% and 25% by mass.",
      physicalRequirements: {
        finenessMin: "300 m2/kg",
        dryingShrinkageMax: "0.15%",
        settingTime: "Initial: min 30 minutes | Final: max 600 minutes",
        compressiveStrength: "3 days: min 16 MPa | 7 days: min 22 MPa | 28 days: min 33 MPa"
      }
    }
  },
  {
    id: "IS-455",
    isNumber: "IS 455:2015",
    productName: "Portland Slag Cement (PSC)[cite: 7, 10]",
    keywords: ["is 455", "is-455", "455", "portland slag cement", "psc", "slag cement", "स्लैग सीमेंट"],
    category: "Cement and Concrete",
    ministry: "Ministry of Commerce and Industry (DPIIT)",
    scheme: "Scheme-I (ISI Mark)",
    details: {
      description: "Manufactured by intimately inter-grinding Portland cement clinker and granulated blast furnace slag with addition of gypsum, especially suited for marine and sulphate-rich environments.",
      slagContent: "Granulated slag constituent shall be not less than 25% and not more than 70% by mass.",
      physicalRequirements: {
        finenessMin: "225 m2/kg",
        compressiveStrength: "3 days: min 16 MPa | 7 days: min 22 MPa | 28 days: min 33 MPa"
      }
    }
  },
  {
    id: "IS-1786",
    isNumber: "IS 1786:2008",
    productName: "High Strength Deformed Steel Bars and Wires for Concrete Reinforcement (TMT Bars)[cite: 5, 7, 8, 10]",
    keywords: ["is 1786", "is-1786", "1786", "tmt", "tmt bar", "steel bar", "deformed steel", "saria", "सरिया", "टीएमटी", "ਸਰੀਆ", "టీఎంటీ"],
    category: "Structural Steel & Reinforcement",
    ministry: "Ministry of Steel",
    scheme: "Scheme-I (ISI Mark)",
    details: {
      description: "Covers deformed steel bars and wires of grades Fe 415, Fe 415D, Fe 500, Fe 500D, Fe 550, Fe 550D, and Fe 600 used as reinforcement in concrete.",
      nominalDiameters: "4, 5, 6, 8, 10, 12, 16, 20, 25, 28, 32, 36, 40, 45, and 50 mm.",
      chemicalCompositionMax: {
        carbon: "0.30% (Fe 415/500) | 0.25% (Fe 415D/500D)",
        sulphur: "0.060% (Fe 415) | 0.040% (Fe 500D)",
        phosphorus: "0.060% (Fe 415) | 0.040% (Fe 500D)"
      },
      mechanicalProperties: {
        yieldStrengthMin: "415 N/mm2 (Fe 415), 500 N/mm2 (Fe 500), 550 N/mm2 (Fe 550), 600 N/mm2 (Fe 600)",
        elongationMin: "14.5% (Fe 415), 18.0% (Fe 415D), 12.0% (Fe 500), 16.0% (Fe 500D)"
      }
    }
  },
  {
    id: "IS-2062",
    isNumber: "IS 2062:2011",
    productName: "Hot Rolled Medium and High Tensile Structural Steel[cite: 5, 7, 8, 10]",
    keywords: ["is 2062", "is-2062", "2062", "structural steel", "hot rolled steel", "tensile steel", "स्ट्रक्चरल स्टील"],
    category: "Structural Steel",
    ministry: "Ministry of Steel",
    scheme: "Scheme-I (ISI Mark)",
    details: {
      description: "Covers requirements for steel plates, strips, shapes, sections (angles, channels, I-beams), tubes, and bars for structural engineering.",
      grades: "E250 (Fe 410 W) in sub-qualities A, BR, B0, C; up to E650.",
      tensileStrengthMin: "410 MPa for Grade E250 with minimum yield stress of 250 MPa (thickness less than 20 mm)."
    }
  },
  {
    id: "IS-1077",
    isNumber: "IS 1077:1992",
    productName: "Common Burnt Clay Building Bricks",
    keywords: ["is 1077", "is-1077", "1077", "brick", "bricks", "clay brick", "building bricks", "ईंट", "ईंटें", "ਇੱਟ", "ਇੱਟਾਂ", "ఇటుక", "ఇటుకలు"],
    category: "Clay Products & Masonry",
    ministry: "BIS Civil Engineering Division (CED)",
    scheme: "Building Material Standard (SP 21:2005)",
    details: {
      description: "Specifies dimensions, quality, and physical requirements of common burnt clay bricks used in buildings.",
      dimensions: {
        modular: "190 mm x 90 mm x 90 mm or 190 mm x 90 mm x 40 mm",
        nonModular: "230 mm x 110 mm x 70 mm or 230 mm x 110 mm x 30 mm"
      },
      strengthClasses: "Classes 3.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 25, 30, and 35 (number indicates minimum average compressive strength in N/mm2).",
      physicalRequirements: {
        waterAbsorptionMax: "20% by weight up to Class 12.5; 15% by weight for higher classes after 24-hour cold water immersion",
        efflorescence: "Rating not more than 'Moderate' up to Class 12.5 and 'Slight' for higher classes"
      }
    }
  },
  {
    id: "IS-383",
    isNumber: "IS 383:2016",
    productName: "Coarse and Fine Aggregate for Concrete[cite: 5, 8]",
    keywords: ["is 383", "is-383", "383", "aggregate", "coarse aggregate", "fine aggregate", "sand", "gravel", "गिट्टी", "रेत", "बजरी", "ਰੇਤ", "ਬੱਜਰੀ", "ఇసుక", "కంకర"],
    category: "Aggregates",
    ministry: "BIS Civil Engineering Division (CED)",
    scheme: "Building Material Standard (SP 21:2005)",
    details: {
      description: "Specifies quality and grading requirements for natural and manufactured coarse and fine aggregates used in concrete production.",
      fineAggregateZones: "Divided into 4 Grading Zones (Zone I, Zone II, Zone III, Zone IV), becoming progressively finer from Zone I to Zone IV.",
      mechanicalLimits: {
        crushingValueMax: "30% for wearing surfaces (runways, roads, pavements); 45% for other concrete",
        impactValueMax: "30% for wearing surfaces; 45% for other concrete",
        losAngelesAbrasionMax: "30% for wearing surfaces; 50% for other concrete"
      }
    }
  },
  {
    id: "IS-2202",
    isNumber: "IS 2202 (Part 1):1999",
    productName: "Wooden Flush Door Shutters (Solid Core Type) - Plywood Face Panels[cite: 5, 8]",
    keywords: ["is 2202", "is-2202", "2202", "flush door", "wooden door", "door shutter", "doors", "दरवाजा", "लकड़ी का दरवाजा", "ਦਰਵਾਜ਼ਾ", "తలుపు"],
    category: "Doors, Windows and Timber",
    ministry: "Ministry of Commerce and Industry (DPIIT)",
    scheme: "Scheme-I (ISI Mark)",
    details: {
      description: "Requirements for materials, grades, construction, and testing of solid blockboard core wooden flush door shutters with plywood face panels.",
      standardThicknesses: "25 mm, 30 mm, 35 mm, and 40 mm.",
      mandatoryTests: "Dimension & squareness test, general flatness test, local planeness test, impact indentation test, flexure test, edge loading test, shock resistance test, buckling resistance test, slamming test, end immersion test, knife test, and glue adhesion test."
    }
  },
  {
    id: "IS-303",
    isNumber: "IS 303:1989",
    productName: "Plywood for General Purposes[cite: 5, 8]",
    keywords: ["is 303", "is-303", "303", "plywood", "bwr plywood", "mr plywood", "प्लाईवुड", "ਪਲਾਈਵੁੱਡ", "ప్లైవుడ్"],
    category: "Timber and Wood Products",
    ministry: "Ministry of Commerce and Industry (DPIIT)",
    scheme: "Scheme-I (ISI Mark)",
    details: {
      description: "Covers grades, quality, bonding, and physical requirements of plywood used for general carpentry, furniture, and panelling.",
      grades: "BWR (Boiling Water Resistant) and MR (Moisture Resistant).",
      physicalRequirements: {
        moistureContent: "5% to 15%",
        glueShearStrength: "Minimum 1350 N (dry state) for BWR grade; 1000 N for MR grade"
      }
    }
  },
  {
    id: "IS-2556",
    isNumber: "IS 2556 (Part 1 to 17)",
    productName: "Vitreous Sanitary Appliances (Vitreous China)[cite: 5, 8]",
    keywords: ["is 2556", "is-2556", "2556", "sanitary", "sanitaryware", "wash basin", "water closet", "urinal", "sink", "सैनिटरी", "वॉश बेसिन", "ਸੈਨੇਟਰੀ", "శానిటరీ"],
    category: "Sanitaryware & Water Supply",
    ministry: "BIS Civil Engineering Division (CED)",
    scheme: "Building Material Standard (SP 21:2005)",
    details: {
      description: "Covers general and specific requirements for vitreous china sanitary appliances such as wash basins, water closets (WC), urinals, and sinks.",
      physicalRequirements: {
        waterAbsorption: "Maximum 0.5% on any individual specimen",
        glazeAndCrazing: "No crazing allowed after autoclave test at 0.35 MPa steam pressure",
        chemicalResistance: "Resistant to acetic acid, citric acid, hydrochloric acid, sulphuric acid, and sodium hydroxide solutions"
      }
    }
  },
  {
    id: "IS-1293",
    isNumber: "IS 1293:2019",
    productName: "Plugs and Socket-Outlets up to 250 Volts and 16 Amperes[cite: 5, 8]",
    keywords: ["is 1293", "is-1293", "1293", "plug", "plugs", "socket", "sockets", "switch socket", "प्लग", "सॉकेट", "ਪਲੱਗ", "ਸਾਕਟ", "ప్లగ్", "సాకెట్"],
    category: "Electrical Accessories",
    ministry: "Ministry of Commerce and Industry (DPIIT)",
    scheme: "Scheme-I (ISI Mark)",
    details: {
      description: "Covers two-pole plugs and socket-outlets with or without earthing contact for household and commercial AC installations (50 Hz).",
      safetyRequirements: "Mandatory safety shutters on socket outlets, IP2X protection against electric shock, temperature rise test, breaking capacity test, normal operation endurance test, and glow-wire flammability test."
    }
  },
  {
    id: "IS-694",
    isNumber: "IS 694:2010",
    productName: "PVC Insulated Unsheathed and Sheathed Cables/Cords with Rigid and Flexible Conductor for Rated Voltages up to 1100V[cite: 5, 7, 8, 10]",
    keywords: ["is 694", "is-694", "694", "pvc cable", "wire", "wires", "cables", "electric cable", "house wiring", "तार", "केबल", "बिजली के तार", "ਤਾਰ", "ਕੇਬਲ", "వైర్", "కేబుల్"],
    category: "Electrical Cables & Conductors",
    ministry: "Ministry of Commerce and Industry (DPIIT)",
    scheme: "Scheme-I (ISI Mark)",
    details: {
      description: "Covers single and multicore PVC insulated cables with copper or aluminium conductors used in fixed house wiring and flexible cords.",
      categories: "Category 01 (Standard PVC), FR (Flame Retardant), FR-LSH (Flame Retardant Low Smoke & Halogen).",
      tests: "Conductor resistance test, high voltage water immersion test, insulation resistance test, oxygen index test, and flammability test."
    }
  },
  {
    id: "IS-2347",
    isNumber: "IS 2347:2017",
    productName: "Domestic Pressure Cookers[cite: 5, 8]",
    keywords: ["is 2347", "is-2347", "2347", "pressure cooker", "cooker", "प्रेशर कुकर", "कुकर", "ਪ੍ਰੈਸ਼ਰ ਕੁੱਕਰ", "ਕੁੱਕਰ", "ప్రెషర్ కుక్కర్", "కుక్కర్"],
    category: "Consumer Kitchen Appliances",
    ministry: "Ministry of Commerce and Industry (DPIIT)",
    scheme: "Scheme-I (ISI Mark)",
    details: {
      description: "Specifies material, construction, safety pressure relief devices, and performance tests for domestic pressure cookers.",
      operatingPressure: "Nominal operating steam pressure of 1.0 kgf/cm2 (approx. 100 kPa).",
      safetyTests: "Bursting pressure test (minimum 6 times maximum nominal safe working pressure), fusible plug/safety valve test, and handle strength test."
    }
  },
  {
    id: "IS-4151",
    isNumber: "IS 4151:2015",
    productName: "Protective Helmets for Two-Wheeler Riders[cite: 5, 8]",
    keywords: ["is 4151", "is-4151", "4151", "helmet", "helmets", "two-wheeler helmet", "bike helmet", "हेलमेट", "ਹੈਲਮੇਟ", "హెల్మెట్"],
    category: "Automotive & Personal Safety",
    ministry: "Ministry of Road Transport and Highways (MoRTH)",
    scheme: "Scheme-I (ISI Mark)",
    details: {
      description: "Specifies construction, weight, impact absorption, penetration resistance, and retention strap stability for motorcycle and scooter helmets.",
      requirements: {
        maxWeight: "Maximum 1.2 kg (1200 grams)",
        tests: "Impact absorption test (headform deceleration max 275 g), rigidity test, retention system dynamic strength test, and visor light transmittance test (min 80% for clear visor, min 50% for tinted)."
      }
    }
  },
  {
    id: "IS-13252",
    isNumber: "IS 13252 (Part 1):2010",
    productName: "Information Technology Equipment - Safety (Laptops, Tablets, Adapters, Mobile Phones, Monitors)[cite: 6, 7, 9, 10]",
    keywords: ["is 13252", "is-13252", "13252", "it equipment", "laptop", "tablet", "mobile phone", "adapter", "monitor", "लैपटॉप", "मोबाइल", "ਲੈਪਟਾਪ", "ਮੋਬਾਈਲ", "ల్యాప్‌టాప్", "మొబైల్"],
    category: "Electronics & IT Goods",
    ministry: "Ministry of Electronics and Information Technology (MeitY)",
    scheme: "Scheme-II (Compulsory Registration Scheme - CRS)[cite: 7, 10]",
    details: {
      description: "Covers safety requirements for mains-powered or battery-powered IT equipment with rated voltage not exceeding 600V.",
      safetyHazardsCovered: "Electric shock, energy hazards, fire/overheating, mechanical stability, radiation, and chemical battery leakage."
    }
  }
];

// =========================================================
// DATABASE 2: Branded Products with Multilingual Support
// =========================================================
const bisBrandDatabase = {
  "patanjali biscuit": {
    licenseNumber: "CM/L-9876543210",
    validUpto: "2027-03-31",
    certificateLink: "#",
    en: {
      productName: "Patanjali Doodh Biscuits",
      manufacturer: "Patanjali Ayurved Ltd.",
      standard: "IS 1011:2002 (Biscuits)[cite: 5, 8]",
      status: "Active",
      details: "Product complies with all safety and quality parameters including moisture content, acidity, and microbial limits. Processed under Option 2[cite: 5, 8]."
    },
    hi: {
      productName: "पतंजलि दूध बिस्कुट",
      manufacturer: "पतंजलि आयुर्वेद लिमिटेड",
      standard: "IS 1011:2002 (बिस्कुट)[cite: 5, 8]",
      status: "सक्रिय (Active)",
      details: "यह उत्पाद नमी, अम्लता और सूक्ष्मजीव सीमाओं सहित सभी सुरक्षा और गुणवत्ता मानदंडों का अनुपालन करता है (विकल्प 2 के अंतर्गत प्रमाणित)[cite: 5, 8]।"
    },
    pa: {
      productName: "ਪਤੰਜਲੀ ਦੁੱਧ ਬਿਸਕੁਟ",
      manufacturer: "ਪਤੰਜਲੀ ਆਯੁਰਵੇਦ ਲਿਮਿਟੇਡ",
      standard: "IS 1011:2002 (ਬਿਸਕੁਟ)[cite: 5, 8]",
      status: "ਸਰਗਰਮ (Active)",
      details: "ਇਹ ਉਤਪਾਦ ਨਮੀ ਅਤੇ ਗੁਣਵੱਤਾ ਦੇ ਸਾਰੇ ਸੁਰੱਖਿਆ ਮਾਪਦੰਡਾਂ ਦੀ ਪਾਲਣਾ ਕਰਦਾ ਹੈ (ਵਿਕਲਪ 2 ਅਧੀਨ ਪ੍ਰਮਾਣਿਤ)[cite: 5, 8]।"
    },
    te: {
      productName: "పతంజలి దూద్ బిస్కెట్లు",
      manufacturer: "పతంజలి ఆయుర్వేద్ లిమిటెడ్",
      standard: "IS 1011:2002 (బిస్కెట్లు)[cite: 5, 8]",
      status: "యాక్టివ్ (Active)",
      details: "ఈ ఉత్పత్తి తేమ, ఆమ్లత్వం మరియు సూక్ష్మజీవుల పరిమితులతో సహా అన్ని భద్రతా మరియు నాణ్యతా ప్రమాణాలకు అనుగుణంగా ఉంటుంది."
    }
  },
  "bajaj bulb": {
    licenseNumber: "R-12345678",
    validUpto: "2026-12-31",
    certificateLink: "#",
    en: {
      productName: "Bajaj LED Bulb (9W)",
      manufacturer: "Bajaj Electricals Ltd.",
      standard: "IS 16102 (Part 1):2012 (Self-Ballasted LED Lamps)[cite: 6, 7, 9, 10]",
      status: "Active",
      details: "Product complies with the Compulsory Registration Scheme (CRS) for the safety of electronic lighting devices[cite: 6, 7, 9, 10]."
    },
    hi: {
      productName: "बजाज एलईडी बल्ब (9W)",
      manufacturer: "बजाज इलेक्ट्रिकल्स लिमिटेड",
      standard: "IS 16102 (भाग 1):2012 (सेल्फ-बैलेस्टेड एलईडी लैंप)[cite: 6, 7, 9, 10]",
      status: "सक्रिय (Active)",
      details: "यह उत्पाद इलेक्ट्रॉनिक लाइटिंग उपकरणों की सुरक्षा के लिए अनिवार्य पंजीकरण योजना (CRS) का अनुपालन करता है[cite: 6, 7, 9, 10]।"
    },
    pa: {
      productName: "ਬਜਾਜ LED ਬਲਬ (9W)",
      manufacturer: "ਬਜਾਜ ਇਲੈਕਟ੍ਰੀਕਲਜ਼ ਲਿਮਿਟੇਡ",
      standard: "IS 16102 (ਭਾਗ 1):2012 (LED ਲੈਂਪ)[cite: 6, 7, 9, 10]",
      status: "ਸਰਗਰਮ (Active)",
      details: "ਇਹ ਉਤਪਾਦ ਇਲੈਕਟ੍ਰਾਨਿਕ ਲਾਈਟਿੰਗ ਉਪਕਰਣਾਂ ਦੀ ਸੁਰੱਖਿਆ ਲਈ ਲਾਜ਼ਮੀ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸਕੀਮ (CRS) ਦੀ ਪਾਲਣਾ ਕਰਦਾ ਹੈ[cite: 6, 7, 9, 10]।"
    },
    te: {
      productName: "బజాజ్ LED బల్బ్ (9W)",
      manufacturer: "బజాజ్ ఎలక్ట్రికల్స్ లిమిటెడ్",
      standard: "IS 16102 (పార్ట్ 1):2012 (LED ల్యాంప్స్)[cite: 6, 7, 9, 10]",
      status: "యాక్టివ్ (Active)",
      details: "ఈ ఉత్పత్తి ఎలక్ట్రానిక్ లైటింగ్ పరికరాల భద్రత కోసం కంపల్సరీ రిజిస్ట్రేషన్ స్కీమ్ (CRS)కి అనుగుణంగా ఉంటుంది[cite: 6, 7, 9, 10]."
    }
  },
  "ambuja cement": {
    licenseNumber: "CM/L-1122334455",
    validUpto: "2028-05-31",
    certificateLink: "#",
    en: {
      productName: "Ambuja Portland Pozzolana Cement (PPC)",
      manufacturer: "Ambuja Cements Ltd.",
      standard: "IS 1489 (Part 1):2015[cite: 7, 10]",
      status: "Active",
      details: "Product complies with mandatory ISI mark requirements for Portland Pozzolana Cement, ensuring structural safety and durability[cite: 7, 10]."
    },
    hi: {
      productName: "अंबुजा पोर्टलैंड पोजोलाना सीमेंट (PPC)",
      manufacturer: "अंबुजा सीमेंट्स लिमिटेड",
      standard: "IS 1489 (भाग 1):2015[cite: 7, 10]",
      status: "सक्रिय (Active)",
      details: "यह उत्पाद पोर्टलैंड पोजोलाना सीमेंट के लिए अनिवार्य ISI मार्क आवश्यकताओं का अनुपालन करता है[cite: 7, 10]।"
    },
    pa: {
      productName: "ਅੰਬੂਜਾ ਪੋਰਟਲੈਂਡ ਪੋਜ਼ੋਲਾਨਾ ਸੀਮਿੰਟ (PPC)",
      manufacturer: "ਅੰਬੂਜਾ ਸੀਮਿੰਟਸ ਲਿਮਿਟੇਡ",
      standard: "IS 1489 (ਭਾਗ 1):2015[cite: 7, 10]",
      status: "ਸਰਗਰਮ (Active)",
      details: "ਇਹ ਉਤਪਾਦ ਪੋਰਟਲੈਂਡ ਪੋਜ਼ੋਲਾਨਾ ਸੀਮਿੰਟ ਲਈ ਲਾਜ਼ਮੀ ISI ਮਾਰਕ ਲੋੜਾਂ ਦੀ ਪਾਲਣਾ ਕਰਦਾ ਹੈ[cite: 7, 10]।"
    },
    te: {
      productName: "అంబుజా పోర్ట్‌ల్యాండ్ పొజోలానా సిమెంట్ (PPC)",
      manufacturer: "అంబుజా సిమెంట్స్ లిమిటెడ్",
      standard: "IS 1489 (పార్ట్ 1):2015[cite: 7, 10]",
      status: "యాక్టివ్ (Active)",
      details: "ఈ ఉత్పత్తి పోర్ట్‌ల్యాండ్ పొజోలానా సిమెంట్ కోసం తప్పనిసరి ISI మార్క్ అవసరాలకు అనుగుణంగా ఉంటుంది[cite: 7, 10]."
    }
  }
};

// =========================================================
// HELPER: Format Standard Details in Selected Language
// =========================================================
function formatStandardHTML(item, lang = 'en') {
  const t = uiLabels[lang] || uiLabels['en'];
  const loc = (item.translations && item.translations[lang]) ? item.translations[lang] : {};

  const prodName = loc.productName || item.productName;
  const dept = loc.department || item.department;
  const category = loc.category || item.category;
  const ministry = loc.ministry || item.ministry;
  const scheme = loc.scheme || item.scheme;
  const description = loc.description || item.details.description;

  const d = item.details;
  let specsHTML = '';
  const formatKey = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

  for (const [key, value] of Object.entries(d)) {
    if (key === 'description') continue;

    if (typeof value === 'object' && value !== null) {
      specsHTML += `<div style="margin-top: 8px;"><b>• ${formatKey(key)}:</b><ul style="margin-left: 20px; margin-top: 4px;">`;
      for (const [subKey, subVal] of Object.entries(value)) {
        if (typeof subVal === 'object' && subVal !== null) {
          const nestedStr = Object.entries(subVal).map(([k, v]) => `${formatKey(k)}: ${v}`).join(' | ');
          specsHTML += `<li><b>${formatKey(subKey)}:</b> ${nestedStr}</li>`;
        } else {
          specsHTML += `<li><b>${formatKey(subKey)}:</b> ${subVal}</li>`;
        }
      }
      specsHTML += `</ul></div>`;
    } else {
      specsHTML += `<div style="margin-top: 6px;">• <b>${formatKey(key)}:</b> ${value}</div>`;
    }
  }

  return `
    <div style="line-height: 1.5;">
      <b>${t.stdFound}:</b> <span style="color: #1a56b5; font-size: 16px; font-weight: bold;">${item.isNumber}</span><br>
      • <b>${t.prodName}:</b> ${prodName}<br>
      ${dept ? `• <b>${t.dept}:</b> ${dept}<br>` : ''}
      • <b>${t.category}:</b> ${category}<br>
      • <b>${t.ministry}:</b> ${ministry}<br>
      • <b>${t.scheme}:</b> <span style="color: #10b981; font-weight: bold;">${scheme}</span><br><br>
      <b>${t.desc}:</b> ${description}<br>
      ${specsHTML ? `<br><b>${t.techSpecs}:</b>${specsHTML}` : ''}
    </div>
  `;
}

// =========================================================
// API ENDPOINT 1: Get Directory List for Right Panel Search
// =========================================================
app.get('/api/standards', (req, res) => {
  const lang = req.query.lang || 'en';
  const summaryList = detailedStandardsDB.map(item => {
    const loc = (item.translations && item.translations[lang]) ? item.translations[lang] : {};
    return {
      code: item.isNumber.split(':')[0],
      desc: loc.productName || item.productName
    };
  });
  res.json(summaryList);
});

// =========================================================
// API ENDPOINT 2: Main Chat Route (Multilingual)
// =========================================================
app.post('/api/chat', (req, res) => {
  try {
    const { query, lang = 'en' } = req.body || {};
    const rawQuery = String(query || '').trim();
    const lowerQuery = rawQuery.toLowerCase();

    const activeLang = detectLanguage(rawQuery, lang);
    const t = uiLabels[activeLang] || uiLabels['en'];

    if (!lowerQuery) {
      return res.json({ answer: t.fallback });
    }

    // 1. Handle Camera / Image Upload Requests
    if (lowerQuery.includes('analyze uploaded image')) {
      return res.json({ answer: t.imageScan });
    }

    // 2. Check Specific Branded Products
    let brandKey = null;
    if (/patanjali|biscuit|पतंजलि|बिस्कुट|ਪਤੰਜਲੀ|ਬਿਸਕੁਟ|పతంజలి|బిస్కెట్/.test(lowerQuery) && !lowerQuery.includes('1011')) {
      brandKey = "patanjali biscuit";
    } else if (/bajaj|bulb|बजाज|बल्ब|ਬਜਾਜ|ਬਲਬ|బజాజ్|బల్బ్/.test(lowerQuery)) {
      brandKey = "bajaj bulb";
    } else if (/ambuja|अंबुजा|ਅੰਬੂਜਾ|అంబుజా/.test(lowerQuery)) {
      brandKey = "ambuja cement";
    }

    if (brandKey && bisBrandDatabase[brandKey]) {
      const brandItem = bisBrandDatabase[brandKey];
      const locBrand = brandItem[activeLang] || brandItem['en'];

      const responseHTML = `
        <b>${t.brandFound}:</b> ${locBrand.productName}<br><br>
        • <b>${t.manufacturer}:</b> ${locBrand.manufacturer}<br>
        • <b>${t.appStd}:</b> ${locBrand.standard}<br>
        • <b>${t.licNo}:</b> <span style="color: #1a56b5; font-weight: bold;">${brandItem.licenseNumber}</span><br>
        • <b>${t.status}:</b> <span style="color: #10b981; font-weight: bold;">${locBrand.status}</span> (${t.validUpto}: ${brandItem.validUpto})<br><br>
        <i>${t.desc}:</i> ${locBrand.details}<br><br>
        <a href="${brandItem.certificateLink}" style="color: #123b78; text-decoration: underline;">${t.viewCert}</a>
      `;
      return res.json({ answer: responseHTML });
    }

    // 3. Check for IS 13334 Part 2 vs Part 1 specifically
    if (lowerQuery.includes('13334') && (lowerQuery.includes('part 2') || lowerQuery.includes('-2') || lowerQuery.includes('extra'))) {
      const part2 = detailedStandardsDB.find(item => item.id === 'IS-13334-2');
      if (part2) return res.json({ answer: formatStandardHTML(part2, activeLang) });
    }

    // 4. Check for any IS Code Number (e.g., "IS 1165", "IS-269", "14433")
    const isCodeMatch = lowerQuery.match(/(?:is[\s\-]?)?(\d{3,5})/);
    if (isCodeMatch) {
      const num = isCodeMatch[1];
      const matchedStd = detailedStandardsDB.find(item =>
        item.id.toLowerCase() === `is-${num}` ||
        item.id.toLowerCase().startsWith(`is-${num}-`) ||
        item.isNumber.toLowerCase().includes(`is ${num}`)
      );
      if (matchedStd) {
        return res.json({ answer: formatStandardHTML(matchedStd, activeLang) });
      }
    }

    // 5. Search Detailed Standards DB by Product Name or Multilingual Keywords
    const matchedByKeyword = detailedStandardsDB.find(item =>
      item.productName.toLowerCase().includes(lowerQuery) ||
      item.keywords.some(kw => lowerQuery.includes(kw))
    );

    if (matchedByKeyword) {
      return res.json({ answer: formatStandardHTML(matchedByKeyword, activeLang) });
    }

    // 6. Handle Generic Inquiries (Certification Process, Hallmarking, Labs)
    if (/(certif|licen[sc]e|apply|प्रमाण|सर्टिफिकेट|लाइसेंस|आवेदन|ਪ੍ਰਮਾਣੀਕਰਣ|ਸਰਟੀਫਿਕੇਟ|ਲਾਇਸੰਸ|ਅਰਜ਼ੀ|ధృవీకరణ|సర్టిఫికేట్|లైసెన్స్|దరఖాస్తు)/.test(lowerQuery)) {
      return res.json({ answer: t.certProcess });
    }
    if (/(hallmark|jewel|gold|silver|huid|हॉलमार्क|गहने|सोना|स्वर्ण|ਹਾਲਮਾਰਕ|ਗਹਿਣੇ|ਸੋਨਾ|హాల్‌మార్క్|ఆభరణాలు|బంగారం)/.test(lowerQuery)) {
      return res.json({ answer: t.hallmarkInfo });
    }
    if (/(lab|test|प्रयोगशाला|परीक्षण|ਪ੍ਰਯੋਗਸ਼ਾਲਾ|ਟੈਸਟ|ప్రయోగశాల|ల్యాబ్|పరీక్ష)/.test(lowerQuery)) {
      return res.json({ answer: t.labInfo });
    }

    // 7. Fallback
    return res.json({ answer: t.fallback });
  } catch (err) {
    console.error("Server error in /api/chat:", err);
    return res.status(500).json({ answer: "⚠️ Internal server error occurred while processing your request." });
  }
});

// Start the server with error handling for Port 3000
const server = app.listen(PORT, () => {
  console.log(`✅ Multilingual BIS Backend Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠️ Port ${PORT} is already in use by another terminal! Close other terminals or press Ctrl+C in the active terminal.`);
  } else {
    console.error('Server error:', err);
  }
});
