class FuzzyFloodPrediction {
  fuzzify(rainfall, riverFlow) {
    let rain = { Rendah: 0, Sedang: 0, Tinggi: 0 };
    let flow = { Rendah: 0, Sedang: 0, Tinggi: 0 };

    // Fuzzifikasi curah hujan
    rain.Rendah = rainfall <= 100 ? 1 : rainfall <= 150 ? (150 - rainfall) / 50 : 0; // >100 = 1, 100-150=fuzzy, >150=0
    rain.Sedang =
      rainfall > 100 && rainfall <= 200
        ? (rainfall - 100) / 50
        : rainfall > 200 && rainfall <= 300
          ? (300 - rainfall) / 100
          : 0; // >100=0, 100-200= fuzzy naik,200-300=fuzzy turun, >300=0
    rain.Tinggi = rainfall > 300 ? (rainfall - 300) / 100 : 0; // 300-400=fuzzy, >400=1, <300=0

    // Fuzzifikasi debit sungai
    flow.Rendah = riverFlow <= 200 ? 1 : riverFlow <= 300 ? (300 - riverFlow) / 100 : 0; // >200=1, 200-300=fuzzy, >300=0
    flow.Sedang =
      riverFlow > 200 && riverFlow <= 1000
        ? (riverFlow - 200) / 800
        : riverFlow > 1000 && riverFlow <= 2000
          ? (2000 - riverFlow) / 1000
          : 0; //>200=0, 200-1000=fuzzy naik, 1000-2000=fuzzy turun, >2000=0
    flow.Tinggi = riverFlow > 1000 ? (riverFlow - 1000) / 4000 : 0; //>1000=0, 1000-5000=fuzzy, >5000=1

    return { rain, flow };
  }

  // rules
  predictFlood(rain, flow) {
    const rules = [
      { membership: Math.min(rain.Tinggi, flow.Tinggi), output: 100 },
      { membership: Math.min(rain.Tinggi, flow.Sedang), output: 85 },
      { membership: Math.min(rain.Tinggi, flow.Rendah), output: 70 },
      { membership: Math.min(rain.Sedang, flow.Tinggi), output: 75 },
      { membership: Math.min(rain.Sedang, flow.Sedang), output: 50 },
      { membership: Math.min(rain.Sedang, flow.Rendah), output: 40 },
      { membership: Math.min(rain.Rendah, flow.Tinggi), output: 60 },
      { membership: Math.min(rain.Rendah, flow.Sedang), output: 30 },
      { membership: Math.min(rain.Rendah, flow.Rendah), output: 20 },
    ];
    //defuzzy
    let numerator = 0; //perkalian membership & output
    let denominator = 0; //menyimpan nilai membership setiap rules

    rules.forEach((rule) => {
      numerator += rule.membership * rule.output;
      denominator += rule.membership;
    });

    return denominator === 0 ? 0 : numerator / denominator; //denominator = 0=0, denominator x= 0 : numerator
  }

  // warning
  getFloodWarning(floodRisk) {
    if (floodRisk > 75) return "Bahaya Tinggi: Banjir kemungkinan besar terjadi! Segera lakukan evakuasi.";
    if (floodRisk > 50) return "Bahaya Sedang: Ada potensi banjir. Waspada dan persiapkan perlindungan.";
    return "Bahaya Rendah: Risiko banjir rendah, tetapi tetap siaga.";
  }
  //saran
  getFloodSuggestion(floodRisk) {
    if (floodRisk > 75) {
      return "Segera cari tempat evakuasi yang aman dan jauh dari lokasi banjir!";
    }
    if (floodRisk > 50) {
      return "Persiapkan perlengkapan darurat seperti senter, obat-obatan, dan makanan tahan lama.";
    }
    return "Tetap pantau cuaca dan informasi terkait banjir, namun tidak perlu tindakan darurat.";
  }
}

document.getElementById("predictButton").addEventListener("click", function () {
  const rainfall = parseFloat(document.getElementById("rainfall").value);
  const riverFlow = parseFloat(document.getElementById("riverFlow").value);

  if (isNaN(rainfall) || isNaN(riverFlow)) {
    alert("Silakan masukkan nilai curah hujan dan debit sungai yang valid!");
    return;
  }

  const predictionSystem = new FuzzyFloodPrediction(); //membuat prediksi sistem
  const { rain, flow } = predictionSystem.fuzzify(rainfall, riverFlow);
  const floodRisk = predictionSystem.predictFlood(rain, flow); //menghitung resiko
  const warning = predictionSystem.getFloodWarning(floodRisk); //memberi peringatan (floodrisk)
  const suggestion = predictionSystem.getFloodSuggestion(floodRisk); //saran (floodrisk)

  const resultElement = document.getElementById("result");
  let riskClass = "";

  if (floodRisk > 75) riskClass = "high-risk";
  else if (floodRisk > 50) riskClass = "medium-risk";
  else riskClass = "low-risk";

  resultElement.className = `result ${riskClass}`;
  resultElement.innerHTML = `
    <p><strong>Prediksi Risiko Banjir:</strong> ${floodRisk.toFixed(2)}%</p> 
    <p><strong>Curah Hujan (mm):</strong> ${rainfall}</p>
    <p><strong>Debit Sungai (m³/s):</strong> ${riverFlow}</p>
    <p><strong>Fuzzifikasi Curah Hujan:</strong> ${JSON.stringify(rain)}</p>
    <p><strong>Fuzzifikasi Debit Sungai:</strong> ${JSON.stringify(flow)}</p>
    <p><strong>Peringatan:</strong> ${warning}</p>
    <p><strong>Saran:</strong> ${suggestion}</p>
  `;

  // Tambahkan alert
  alert(`Hasil Prediksi:\n- Risiko Banjir: ${floodRisk.toFixed(2)}%\n- Peringatan: ${warning}\n- Saran: ${suggestion}`);
}); //hasil berupa alert hasil= resiko (floodrisk).peringatan(warning).saran(suggestion)

document.getElementById("resetButton").addEventListener("click", function () {
  document.getElementById("rainfall").value = "";
  document.getElementById("riverFlow").value = "";

  const resultElement = document.getElementById("result");
  resultElement.innerHTML = "";
  resultElement.className = "result";
});
