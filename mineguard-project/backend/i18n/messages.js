// Messages the server sends back (errors, validation). The website adds ?lang=en or ?lang=ta to every request.
const M = {
  en: {
    loginRequired: "Please log in.", loginAgain: "Please log in again.", disabled: "This account has been disabled.",
    tooMany: "Too many attempts. Please wait a few minutes and try again.", tooManyReq: "Too many requests. Please wait a few minutes.",
    quizTooMany: "Too many quiz requests. Please wait a few minutes.",
    "val.name": "Full name must be 2 to 60 characters.", "val.email": "Please enter a valid email address.",
    "val.pwLen": "Password must be 8 to 72 characters.", "val.pwMix": "Password must contain at least one letter and one number.",
    "val.wid": "Worker ID can only use letters, numbers, - and _ (max 20).",
    dupEmail: "An account with this email already exists.", badLogin: "Incorrect email or password.", badLang: "Invalid language.",
    adminOnly: "This area is only for administrators.", modDisabled: "This module is currently unavailable.",
    notFound: "Not found.", invalid: "Invalid request.", tooLarge: "Request is too large.", server: "Something went wrong on the server.",
    modNotFound: "Module not found.", badCheckpoint: "Invalid checkpoint.", earlierStages: "Please complete the earlier stages first.",
    trainFirst: "Please complete the training before taking the quiz.", badQuestion: "Invalid question.", badAnswer: "Invalid answer.",
    alreadyAnswered: "You already answered this question.", attemptGone: "This quiz attempt is no longer active. Please start the quiz again.",
    needPass: "You need to pass the quiz before you can get a certificate.", certNotFound: "Certificate not found.", certRevoked: "This certificate has been revoked."
  },
  ta: {
    loginRequired: "உள்நுழையுங்கள்.", loginAgain: "மீண்டும் உள்நுழையுங்கள்.", disabled: "இந்தக் கணக்கு முடக்கப்பட்டுள்ளது.",
    tooMany: "அதிகமான முயற்சிகள். சில நிமிடங்கள் காத்திருந்து மீண்டும் முயலுங்கள்.", tooManyReq: "அதிகமான கோரிக்கைகள். சில நிமிடங்கள் காத்திருங்கள்.",
    quizTooMany: "அதிகமான வினாடி வினா கோரிக்கைகள். சில நிமிடங்கள் காத்திருங்கள்.",
    "val.name": "முழுப் பெயர் 2 முதல் 60 எழுத்துகள் இருக்க வேண்டும்.", "val.email": "சரியான மின்னஞ்சல் முகவரியை உள்ளிடுங்கள்.",
    "val.pwLen": "கடவுச்சொல் 8 முதல் 72 எழுத்துகள் இருக்க வேண்டும்.", "val.pwMix": "கடவுச்சொல்லில் குறைந்தது ஒரு எழுத்தும் ஒரு எண்ணும் இருக்க வேண்டும்.",
    "val.wid": "பணியாளர் எண்ணில் எழுத்துகள், எண்கள், - மற்றும் _ மட்டுமே (அதிகபட்சம் 20) பயன்படுத்தலாம்.",
    dupEmail: "இந்த மின்னஞ்சலில் ஏற்கெனவே ஒரு கணக்கு உள்ளது.", badLogin: "மின்னஞ்சல் அல்லது கடவுச்சொல் தவறு.", badLang: "தவறான மொழி.",
    adminOnly: "இந்தப் பகுதி நிர்வாகிகளுக்கு மட்டுமே.", modDisabled: "இந்தத் தொகுதி தற்போது கிடைக்கவில்லை.",
    notFound: "கிடைக்கவில்லை.", invalid: "தவறான கோரிக்கை.", tooLarge: "கோரிக்கை மிகப் பெரியது.", server: "சேவையகத்தில் ஏதோ தவறு ஏற்பட்டது.",
    modNotFound: "தொகுதி கிடைக்கவில்லை.", badCheckpoint: "தவறான நிலை.", earlierStages: "முதலில் முந்தைய நிலைகளை முடிக்கவும்.",
    trainFirst: "வினாடி வினாவுக்கு முன் பயிற்சியை முடிக்கவும்.", badQuestion: "தவறான கேள்வி.", badAnswer: "தவறான பதில்.",
    alreadyAnswered: "இந்தக் கேள்விக்கு ஏற்கெனவே பதிலளித்துவிட்டீர்கள்.", attemptGone: "இந்த வினாடி வினா முயற்சி இப்போது செயலில் இல்லை. வினாடி வினாவை மீண்டும் தொடங்குங்கள்.",
    needPass: "சான்றிதழ் பெற முதலில் வினாடி வினாவில் தேர்ச்சி பெற வேண்டும்.", certNotFound: "சான்றிதழ் கிடைக்கவில்லை.", certRevoked: "இந்தச் சான்றிதழ் ரத்து செய்யப்பட்டுள்ளது."
  }
};
function langOf(req) { const l = req && req.query && req.query.lang; return l === "ta" ? "ta" : "en"; }
module.exports = function msg(req, key) { return (M[langOf(req)][key]) || M.en[key] || M.en.server; };
module.exports.M = M;
