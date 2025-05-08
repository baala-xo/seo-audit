import { NextResponse } from "next/server"
import puppeteer from "puppeteer"

export async function POST(req: Request) {
  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 })

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: "networkidle2" })

  const result = await page.evaluate(() => {
    const title = document.title || null
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute("content") || null
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href") || null
    const h1Count = document.querySelectorAll("h1").length

    const links = Array.from(document.querySelectorAll("link")).map(link => ({
      rel: link.getAttribute("rel"),
      href: link.getAttribute("href"),
      type: link.getAttribute("type"),
      media: link.getAttribute("media")
    }))

    const anchorLinks = Array.from(document.querySelectorAll("a")).map(a => ({
      href: a.getAttribute("href"),
      text: a.textContent?.trim().slice(0, 50) || "",
      rel: a.getAttribute("rel"),
      target: a.getAttribute("target")
    }))

    const images = Array.from(document.querySelectorAll("img")).map(img => ({
      src: img.getAttribute("src"),
      alt: img.getAttribute("alt") || "",
      width: img.getAttribute("width"),
      height: img.getAttribute("height")
    }))

    return { title, metaDescription, canonical, h1Count, links, anchorLinks, images }
  })

  const anchorLinksWithStatus = await Promise.all(result.anchorLinks.map(async (link) => {
    const href = link.href
    if (!href || href.startsWith("javascript:") || href.startsWith("#")) {
      return { ...link, status: "ignored" }
    }

    try {
      const fullURL = href.startsWith("http") ? href : new URL(href, url).href
      const res = await fetch(fullURL, { method: "HEAD" })
      return { ...link, status: res.ok ? "ok" : `broken (${res.status})` }
    } catch (e) {
      return { ...link, status: "broken (fetch error)" }
    }
  }))

  await browser.close()

  return NextResponse.json({ ...result, anchorLinks: anchorLinksWithStatus })
}
