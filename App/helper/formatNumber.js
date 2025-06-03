function formatPhoneNumber(number, international = false) {
  // Hilangkan karakter non-digit

  let cleaned = number.toString().replace(/\D/g, "");
  cleaned = "0" + cleaned;

  // Ganti awalan 0 dengan 62 jika internasional
  if (international) {
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.slice(1);
    }
    return (
      "+62 " +
      cleaned.slice(2, 5) +
      "-" +
      cleaned.slice(5, 9) +
      "-" +
      cleaned.slice(9)
    );
  } else {
    // Format lokal: 08xx-xxxx-xxxx
    if (cleaned.startsWith("0")) {
      return (cleaned = "62" + cleaned.slice(1));
    }
  }
}

module.exports = formatPhoneNumber;
