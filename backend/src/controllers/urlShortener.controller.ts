import { Request, Response } from "express";
import {
  createShortLink,
  getShortLink,
  incrementClicks,
  isUrlSafe,
} from "../services/urlShortener.service.js";

const MAX_URL_LENGTH = 2048;
const CODE_REGEX     = /^[A-Za-z0-9]{6}$/;

/** POST /api/shorten — shorten a URL */
export const shortenUrl = (req: Request, res: Response): void => {
  const { url } = req.body as { url?: unknown };

  if (!url || typeof url !== "string" || !url.trim()) {
    res.status(400).json({ success: false, message: "url is required." });
    return;
  }

  const trimmed = url.trim();

  if (trimmed.length > MAX_URL_LENGTH) {
    res.status(400).json({
      success: false,
      message: `URL must be ${MAX_URL_LENGTH} characters or fewer.`,
    });
    return;
  }

  if (!isUrlSafe(trimmed)) {
    res.status(400).json({
      success: false,
      message:
        "Invalid URL. Only public http:// or https:// URLs are accepted.",
    });
    return;
  }

  const link = createShortLink(trimmed);

  // Build short URL using the request host so it works in both dev and prod
  const proto    = req.headers["x-forwarded-proto"] ?? req.protocol ?? "https";
  const host     = req.headers["x-forwarded-host"]  ?? req.get("host") ?? "";
  const shortUrl = `${proto}://${host}/r/${link.code}`;

  res.status(200).json({
    success:     true,
    code:        link.code,
    shortUrl,
    originalUrl: link.originalUrl,
    expiresAt:   link.expiresAt,
    clicks:      link.clicks,
  });
};

/** GET /r/:code — redirect to the original URL */
export const redirectShortUrl = (req: Request, res: Response): void => {
  const { code } = req.params as { code: string };

  if (!CODE_REGEX.test(code)) {
    res.status(404).json({ success: false, message: "Short link not found." });
    return;
  }

  const link = getShortLink(code);
  if (!link) {
    res.status(404).json({
      success: false,
      message: "Short link not found or has expired.",
    });
    return;
  }

  incrementClicks(code);

  // 302 (temporary) so browsers don't cache the redirect permanently
  res.redirect(302, link.originalUrl);
};

/** GET /api/shorten/:code/info — return metadata (no redirect) */
export const getShortLinkInfo = (req: Request, res: Response): void => {
  const { code } = req.params as { code: string };

  if (!CODE_REGEX.test(code)) {
    res.status(404).json({ success: false, message: "Not found." });
    return;
  }

  const link = getShortLink(code);
  if (!link) {
    res.status(404).json({
      success: false,
      message: "Short link not found or has expired.",
    });
    return;
  }

  res.status(200).json({
    success:     true,
    code:        link.code,
    originalUrl: link.originalUrl,
    expiresAt:   link.expiresAt,
    clicks:      link.clicks,
  });
};
