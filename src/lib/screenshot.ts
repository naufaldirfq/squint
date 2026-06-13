export async function captureScreenshot(targetUrl: string, isMobile: boolean = false): Promise<string> {
  try {
    // Add protocol if missing
    let urlToCapture = targetUrl.trim();
    if (!/^https?:\/\//i.test(urlToCapture)) {
      urlToCapture = `https://${urlToCapture}`;
    }

    try {
      let microlinkUrl = `https://api.microlink.io?url=${encodeURIComponent(urlToCapture)}&screenshot=true`;
      if (isMobile) {
        microlinkUrl += `&viewport.width=390&viewport.height=844&viewport.isMobile=true&viewport.hasTouch=true`;
      }
      
      const response = await fetch(microlinkUrl);
      if (!response.ok) {
        throw new Error(`Microlink API responded with status ${response.status}`);
      }

      const json = await response.json();
      if (json.status !== "success" || !json.data?.screenshot?.url) {
        throw new Error("Failed to get screenshot URL from Microlink");
      }

      const screenshotUrl = json.data.screenshot.url;
      
      // Download the screenshot image and convert it to base64
      const imgResponse = await fetch(screenshotUrl);
      if (!imgResponse.ok) {
        throw new Error(`Failed to download screenshot image from ${screenshotUrl}`);
      }

      const arrayBuffer = await imgResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = buffer.toString("base64");
      
      return `data:image/png;base64,${base64Image}`;
    } catch (microlinkError) {
      console.warn("Microlink failed, falling back to Thum.io:", microlinkError);
      
      const thumUrl = isMobile 
        ? `https://image.thum.io/get/iphoneX/width/400/crop/800/${urlToCapture}`
        : `https://image.thum.io/get/width/1200/crop/800/${urlToCapture}`;
        
      const imgResponse = await fetch(thumUrl);
      if (!imgResponse.ok) {
        throw new Error(`Thum.io fallback failed with status ${imgResponse.status}`);
      }

      const arrayBuffer = await imgResponse.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString("base64");
      return `data:image/png;base64,${base64Image}`;
    }
  } catch (error) {
    console.error("Screenshot capture failed:", error);
    throw error;
  }
}
