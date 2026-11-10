// Module A content. The correct answers live ONLY here on the server, so a worker cannot read them
// by looking at the page's JavaScript. Tamil text is added in the language phase (en is the fallback).
module.exports = {
  key: "fire",
  title: { en: "Fire & Explosion Response", ta: "தீ மற்றும் வெடிப்பு பாதுகாப்பு" },
  passPercent: 80,
  questions: [
    { id: "f1", correctIndex: 1,
      text: { en: "A fire starts at an electrical panel in the mine. What should you do FIRST?", ta: "சுரங்கத்தில் மின் பலகையில் தீ பிடிக்கிறது. முதலில் என்ன செய்ய வேண்டும்?" },
      options: { en: ["Fight it alone with a bucket of water", "Alert others and raise the alarm", "Ignore it because it is small", "Take a photo for the report"], ta: ["ஒரு வாளி தண்ணீரால் தனியாகப் போராடுவது", "மற்றவர்களை எச்சரித்து அலாரத்தை ஒலிக்கச் செய்வது", "சிறியது என்பதால் கவனிக்காமல் விடுவது", "அறிக்கைக்காகப் புகைப்படம் எடுப்பது"] },
      explanation: { en: "Always alert others first, so everyone can get out safely and help can come.", ta: "எல்லோரும் பாதுகாப்பாக வெளியேறவும் உதவி வரவும் முதலில் மற்றவர்களை எச்சரிக்க வேண்டும்." } },
    { id: "f2", correctIndex: 2,
      text: { en: "Which of these must NOT be used on an electrical fire?", ta: "மின் தீக்கு இவற்றில் எதைப் பயன்படுத்தக் கூடாது?" },
      options: { en: ["CO2 extinguisher", "Dry powder extinguisher", "A bucket of water", "All three are safe"], ta: ["CO2 அணைப்பான்", "உலர் தூள் அணைப்பான்", "ஒரு வாளி தண்ணீர்", "மூன்றும் பாதுகாப்பானவை"] },
      explanation: { en: "Water conducts electricity and can cause a deadly shock.", ta: "தண்ணீர் மின்சாரத்தைக் கடத்தும்; உயிருக்கு ஆபத்தான மின் அதிர்ச்சி ஏற்படலாம்." } },
    { id: "f3", correctIndex: 1,
      text: { en: "What does PASS stand for?", ta: "PASS என்பதன் விரிவாக்கம் என்ன?" },
      options: { en: ["Push, Aim, Spray, Stop", "Pull, Aim, Squeeze, Sweep", "Pull, Alert, Shout, Spray", "Pick, Aim, Squeeze, Stand"], ta: ["Push, Aim, Spray, Stop (தள்ளு, குறிவை, தெளி, நிறுத்து)", "Pull, Aim, Squeeze, Sweep (இழு, குறிவை, அழுத்து, தெளி)", "Pull, Alert, Shout, Spray (இழு, எச்சரி, கத்து, தெளி)", "Pick, Aim, Squeeze, Stand (எடு, குறிவை, அழுத்து, நில்)"] },
      explanation: { en: "Pull the pin, Aim at the base, Squeeze the handle, Sweep side to side.", ta: "பின்னை இழுக்கவும் (Pull), அடிப்பகுதியை நோக்கிக் குறிவைக்கவும் (Aim), கைப்பிடியை அழுத்தவும் (Squeeze), இடமிருந்து வலமாகத் தெளிக்கவும் (Sweep)." } },
    { id: "f4", correctIndex: 2,
      text: { en: "Where should you aim the extinguisher?", ta: "அணைப்பானை எங்கே குறிவைக்க வேண்டும்?" },
      options: { en: ["At the top of the flames", "At the smoke", "At the base of the fire", "At the ceiling"], ta: ["தீச்சுடரின் மேற்பகுதியில்", "புகையின் மீது", "நெருப்பின் அடிப்பகுதியில்", "கூரையின் மீது"] },
      explanation: { en: "The base is the fuel source. Hitting the flames alone will not put the fire out.", ta: "அடிப்பகுதியே எரிபொருள் இருக்கும் இடம். சுடரை மட்டும் தாக்கினால் தீ அணையாது." } },
    { id: "f5", correctIndex: 1,
      text: { en: "While fighting a small fire, where should your exit be?", ta: "சிறிய தீயை அணைக்கும்போது உங்கள் வெளியேறும் வழி எங்கே இருக்க வேண்டும்?" },
      options: { en: ["Behind the fire", "Behind you", "Far away from you", "It does not matter"], ta: ["தீக்குப் பின்னால்", "உங்கள் பின்னால்", "உங்களிடமிருந்து தொலைவில்", "எங்கிருந்தாலும் பரவாயில்லை"] },
      explanation: { en: "Keep the exit behind you so you can leave quickly if the fire grows.", ta: "தீ பெரிதானால் உடனே வெளியேற, வெளியேறும் வழி உங்கள் பின்னால் இருக்க வேண்டும்." } }
  ]
};
