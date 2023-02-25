const canvas = document.getElementById('main-canvas');
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;
const offscreenCanvas = canvas.transferControlToOffscreen();
const worker = new Worker(
    new URL('offscreenCanvas.js', import.meta.url),
    {type: 'module'}
);
worker.postMessage({ canvas: offscreenCanvas }, [offscreenCanvas]);


