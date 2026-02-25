# Known Issues & Notes

## Browser Service

**Issue:** OpenClaw browser service sometimes goes offline (timeout errors).
**Solution:** Restart gateway with `openclaw gateway restart` or click the OpenClaw menubar icon → Restart Gateway.
**Note:** Don't wait for browser to come back - diagnose via CSS/JS/code inspection instead.

## YouTube Video Embed

**Issue:** YouTube embeds may not play through Cloudflare Tunnel (trycloudflare.com).
**Root Cause:** Cloudflare sometimes blocks or slows YouTube iframe embeds.
**Solution:** Link to YouTube video instead of embedding. Changed from inline iframe to external link with thumbnail/button.

## Video Player (Internal)

- Video overlay uses `pointer-events: none` when hidden to allow iframe interaction
- Works when deployed on proper hosting (Render, Vercel, etc.)
