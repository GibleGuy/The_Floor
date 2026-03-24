const item = { u: "../images/f1/lewis-hamilton.webp" };
const ALT_EXTENSIONS = ['svg', 'png', 'jpg', 'jpeg', 'gif', 'webp'];

let img = {
    src: "http://127.0.0.1:8000/images/f1/lewis-hamilton.webp?v=1716301323041",
    dataset: { extAttempts: "0" }
};

function handleImageError() {
    const attemptIndex = parseInt(img.dataset.extAttempts);

    const currentSrc = img.src;
    const urlWithoutQuery = currentSrc.split('?')[0];
    const dotIndex = urlWithoutQuery.lastIndexOf('.');
    const basePath = dotIndex > 0 ? urlWithoutQuery.substring(0, dotIndex) : urlWithoutQuery;

    const originalSrc = item.u || '';
    const originalUrlWithoutQuery = originalSrc.split('?')[0];
    const originalDotIndex = originalUrlWithoutQuery.lastIndexOf('.');
    const originalExt = originalDotIndex > 0 ? originalUrlWithoutQuery.substring(originalDotIndex + 1).toLowerCase() : '';

    const toTry = ALT_EXTENSIONS.filter(ext => ext !== originalExt);

    if (attemptIndex < toTry.length) {
        img.dataset.extAttempts = String(attemptIndex + 1);
        img.src = basePath + '.' + toTry[attemptIndex] + '?v=' + Date.now();
        console.log("Attempt " + attemptIndex + " -> next src: " + img.src);
        return true; // continue
    }
    console.log("Exhausted");
    return false;
}

while(handleImageError()) {
    // looping
}
