// Developer-only regression tests. End users only need index.html.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
 const root = path.resolve(__dirname, '..');
 const browser = await chromium.launch({headless:true, args:['--no-sandbox']});
 const context = await browser.newContext({acceptDownloads:true, viewport:{width:1280,height:1000}});
 const page = await context.newPage();
 const errors = [], network = [];
 page.on('pageerror', e => errors.push(e.message));
 page.on('request', r => {if (/^https?:/.test(r.url())) network.push(r.url());});
 const url = process.env.PHOTOEDIT_URL || pathToFileURL(path.join(root,'index.html')).href;
 await page.goto(url);
 await context.setOffline(true);
 assert.equal(await page.locator('#ratio-mode').inputValue(), '4:5');
 assert.equal(await page.locator('#res-mode').inputValue(), 'original');
 assert.equal(await page.locator('#bg-type').inputValue(), 'solid');
 assert.equal(await page.locator('#bg-color').inputValue(), '#000000');
 assert.equal(await page.locator('#compress-toggle').isChecked(), false);
 assert.equal(await page.locator('#format-jpeg').isChecked(), true);
 assert.equal(await page.locator('#format-png').isChecked(), false);
 const picture = async (width,height) => Buffer.from(await page.evaluate(([w,h])=>{
   const c=document.createElement('canvas'); c.width=w;c.height=h;const ctx=c.getContext('2d');
   ctx.fillStyle='#d43b20';ctx.fillRect(0,0,w,h);ctx.fillStyle='#29a162';ctx.fillRect(0,0,Math.floor(w/3),h);
   // Deterministic fine texture makes JPEG quality differences measurable.
   for(let x=0;x<w;x+=3)for(let y=0;y<h;y+=3){ctx.fillStyle=`rgb(${x*13%256},${y*17%256},${(x+y)*11%256})`;ctx.fillRect(x,y,1,1);}
   return c.toDataURL('image/png').split(',')[1];
 },[width,height]),'base64');
 const landscape=await picture(600,400),portrait=await picture(400,800),odd=await picture(601,400);
 await page.locator('#file-input').setInputFiles([{name:'旅行.png',mimeType:'image/png',buffer:landscape}]);
 await page.waitForFunction(()=>document.getElementById('preview-info').textContent.includes('600 × 750'));
 const pixel = await page.evaluate(()=>Array.from(document.getElementById('preview-canvas').getContext('2d').getImageData(0,0,1,1).data));
 assert.deepEqual(pixel,[0,0,0,255]);
 // Dimension matrix and original-mode foreground preservation, including one-pixel rounding.
 const matrix=await page.evaluate(()=>{
  const s=settings(); return [geometry(600,400,s),geometry(400,800,s),geometry(601,400,s),geometry(600,400,{...s,ratio:null}),geometry(600,400,{...s,resolution:'1080',size:1080}),geometry(600,400,{...s,resolution:'long-edge',size:1000}),geometry(600,400,{...s,resolution:'width',size:777,ratio:16/9})];
 });
 assert.deepEqual(matrix.map(g=>[g.width,g.height]),[[600,750],[640,800],[601,752],[600,400],[1080,1350],[800,1000],[777,437]]);
 assert.equal(matrix[2].drawW,601);assert.equal(matrix[2].drawH,400);
 // Download a real offline ZIP with both formats and colliding stems.
 await page.locator('#format-png').check();
 await page.locator('#file-input').setInputFiles([{name:'旅行.png',mimeType:'image/png',buffer:landscape},{name:'旅行.jpg',mimeType:'image/png',buffer:portrait}]);
 const dl=page.waitForEvent('download'); await page.locator('#process-btn').click();const zipDownload=await dl;
 const zipPath=await zipDownload.path(); const zipBuffer=await fs.readFile(zipPath);
 const entries=await page.evaluate(async bytes=>{
  const z=await JSZip.loadAsync(new Uint8Array(bytes),{checkCRC32:true}),out=[];
  for(const [name,f] of Object.entries(z.files)){const b=await f.async('uint8array'),img=await createImageBitmap(new Blob([b]));out.push({name,w:img.width,h:img.height,signature:Array.from(b.slice(0,4))});img.close();}
  return out;
 },Array.from(zipBuffer));
 assert.deepEqual(entries.map(e=>e.name),['旅行_edited.jpg','旅行_edited.png','旅行_edited_2.jpg','旅行_edited_2.png']);
 assert.deepEqual(entries.map(e=>[e.w,e.h]),[[600,750],[600,750],[640,800],[640,800]]);
 assert.deepEqual(entries[0].signature.slice(0,2),[255,216]);assert.deepEqual(entries[1].signature,[137,80,78,71]);
 // Quality changes only JPEG bytes, never dimensions or PNG bytes.
 const encoded=await page.evaluate(async()=>{
  const img=await loadImage(files[0]),s=settings(),g=geometry(img.naturalWidth,img.naturalHeight,s),c=document.createElement('canvas');render(c,img,g,s);
  const high=await encode(c,'jpeg',{...s,compress:false}),low=await encode(c,'jpeg',{...s,compress:true,quality:.2});
  const p1=await encode(c,'png',{...s,compress:false}),p2=await encode(c,'png',{...s,compress:true,quality:.2});
  return {high:high.size,low:low.size,pngEqual:JSON.stringify(Array.from(new Uint8Array(await p1.arrayBuffer())))===JSON.stringify(Array.from(new Uint8Array(await p2.arrayBuffer())))};
 });
 assert.ok(encoded.low<encoded.high);assert.equal(encoded.pngEqual,true);
 // Independent controls via actual UI and live preview.
 await page.locator('#bg-type').selectOption('blur');
 await page.waitForFunction(()=>!document.getElementById('preview-canvas').hidden);
 assert.equal(await page.locator('#ratio-mode').inputValue(),'4:5');assert.equal(await page.locator('#res-mode').inputValue(),'original');
 await page.locator('#ratio-mode').selectOption('original');
 await page.waitForFunction(()=>document.getElementById('preview-info').textContent.includes('輸出 600 × 400'));
 await page.locator('#ratio-mode').selectOption('custom');await page.locator('#ratio-width').fill('16');await page.locator('#ratio-height').fill('9');
 await page.locator('#res-mode').selectOption('width');await page.locator('#target-size').fill('800');
 await page.waitForFunction(()=>document.getElementById('preview-info').textContent.includes('輸出 800 × 450'));
 await page.locator('#target-size').fill('0');await page.locator('#process-btn').click();assert.match(await page.locator('#status').textContent(),/請輸入/);
 await page.locator('#reset-btn').click();
 await page.locator('#format-jpeg').uncheck();await page.locator('#process-btn').click();assert.match(await page.locator('#status').textContent(),/至少勾選/);
 await page.locator('#format-png').check();await page.locator('#export-mode').selectOption('individual');
 await page.locator('#file-input').setInputFiles([{name:'odd.png',mimeType:'image/png',buffer:odd}]);
 const pngEvent=page.waitForEvent('download');await page.locator('#process-btn').click();assert.equal((await pngEvent).suggestedFilename(),'odd_edited.png');
 // Corrupt images do not hang a batch or prevent the next good file from exporting.
 await page.locator('#export-mode').selectOption('zip');
 await page.locator('#file-input').setInputFiles([{name:'broken.png',mimeType:'image/png',buffer:Buffer.from('bad')},{name:'ok.png',mimeType:'image/png',buffer:landscape}]);
 const recovery=page.waitForEvent('download');await page.locator('#process-btn').click();await recovery;
 await page.waitForFunction(()=>document.getElementById('status').textContent.includes('未完整匯出'));
 assert.equal(await page.locator('#process-btn').isEnabled(),true);
 // Folder API simulation: no overwrite, write errors reported, cancellation recoverable.
 await page.evaluate(()=>{
  window.folderWrites=[];window.showDirectoryPicker=async()=>({getFileHandle:async(name,opts)=>{
   if(!opts?.create){if(name==='ok_edited.png')return {};throw new DOMException('missing','NotFoundError');}
   return {createWritable:async()=>({write:async b=>window.folderWrites.push({name,size:b.size}),close:async()=>{},abort:async()=>{}})};
  }});
 });
 await page.locator('#file-input').setInputFiles([{name:'ok.png',mimeType:'image/png',buffer:landscape}]);
 await page.locator('#export-mode').selectOption('directory');await page.locator('#process-btn').click();
 await page.waitForFunction(()=>document.getElementById('status').textContent.includes('已儲存 1'));
 assert.equal((await page.evaluate(()=>window.folderWrites))[0].name,'ok_edited_2.png');
 await page.evaluate(()=>window.showDirectoryPicker=async()=>{throw new DOMException('cancel','AbortError');});
 await page.locator('#process-btn').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('已取消'));assert.equal(await page.locator('#reset-btn').isEnabled(),true);
 await page.evaluate(()=>window.showDirectoryPicker=async()=>({getFileHandle:async()=>{throw new DOMException('denied','NotAllowedError');}}));
 await page.locator('#process-btn').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('未完整匯出'));
 // Unsupported storage and malformed stored data do not stop initialization.
 const blocked=await context.newPage(); await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('denied','SecurityError');}});});await blocked.goto(url);assert.equal(await blocked.locator('#ratio-mode').inputValue(),'4:5');
 await blocked.locator('#save-color').click();await blocked.close();
 await page.locator('#reset-btn').click();await page.waitForFunction(()=>!document.getElementById('preview-canvas').hidden);
 if(process.env.SCREENSHOT_DIR){await fs.mkdir(process.env.SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,'desktop.png'),fullPage:true});}
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 if(process.env.SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,'mobile.png'),fullPage:true});
 assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
 console.log(JSON.stringify({result:'PASS',checks:['defaults','offline ZIP + CRC','JPEG/PNG signatures','multi-format + duplicate names','portrait/landscape geometry','JPEG quality / PNG invariance','live preview','independent controls','invalid input','corrupt-file recovery','folder collision / cancel / denied (simulated)','storage unavailable','mobile overflow','zero network requests','no page errors'],jpegBytes:encoded},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
