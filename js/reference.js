document.getElementById("downloadBtn").addEventListener("click", () => {
  fetch('${API_BASE_URL}/download-reference-pdf')
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Normative_Reference.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    });
});

