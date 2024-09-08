/** @format */

function umgm() {
  const arr = ["bWtkSGxRfVA=", "aFN1b2dycm0=", "WXBfclhfUGk=", "TVhWTV1aW04=", "fVJPa00="];
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
