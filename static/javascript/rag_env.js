/** @format */

function umgm() {
  const arr = ["bWtkW0l+XX0=", "SXx2d1FxbVc=", "V1tRXlxneUY=", "flV6a1NdbUg=", "VllpUkc="];
  return arr
    .map((part) => {
      const ch = atob(part);
      return ch
        .split("")
        .map((char) => String.fromCharCode((char.charCodeAt(0) - 5 + 256) % 256))
        .join("");
    })
    .join("");
}
