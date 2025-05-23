"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function Home() {
  const [url, setUrl] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const audit = async () => {
    setLoading(true)
    const res = await fetch("/api/audit", {
      method: "POST",
      body: JSON.stringify({ url }),
      headers: { "Content-Type": "application/json" },
    })
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>SEO Audit Tool</CardTitle>
          <CardDescription>
            Analyze SEO metadata, anchor links, and images from a website.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button onClick={audit} disabled={loading}>
            {loading ? "Auditing..." : "Run Audit"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic SEO Info</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Title:</strong> {result.title}</p>
              <p><strong>Description:</strong> {result.metaDescription}</p>
              <p><strong>Canonical:</strong> {result.canonical}</p>
              <p><strong>H1 Tags:</strong> {result.h1Count}</p>
            </CardContent>
          </Card>

          {/* Anchor Links */}
          <Card>
            <CardHeader>
              <CardTitle>Anchor Links</CardTitle>
              <CardDescription>All <code>&lt;a&gt;</code> tags with status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {result.anchorLinks?.length ? (
                <ul className="list-disc space-y-1 pl-4">
                  {result.anchorLinks.map((link: any, i: number) => (
                    <li key={i}>
                      <a
                        href={link.href ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {link.text || link.href}
                      </a>{" "}
                      {link.href?.startsWith("http") ? (
                        <span className="text-gray-500">(external)</span>
                      ) : (
                        <span className="text-gray-500">(internal)</span>
                      )}
                      {link.rel && ` | rel: ${link.rel}`}
                      {link.target && ` | target: ${link.target}`}
                      <span
                        className={`ml-2 font-semibold ${link.status?.includes("broken") ? "text-red-600" : "text-green-600"}`}
                      >
                        [{link.status}]
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No anchor tags found.</p>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>
                All images on the site with download option.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {result.images?.length ? (
                result.images.map((img: any, i: number) => {
                  const fullSrc = img.src?.startsWith("http")
                    ? img.src
                    : new URL(img.src, url).href

                  return (
                    <div key={i} className="rounded border p-2 shadow-sm">
                      <img
                        src={fullSrc}
                        alt={img.alt || `Image ${i}`}
                        className="mb-2 h-32 w-full rounded object-contain"
                      />
                      <a
                        href={fullSrc}
                        download
                        rel="noopener noreferrer"
                        target="_blank"
                        className="block text-center text-sm text-blue-600 underline"
                      >
                        Download
                      </a>
                    </div>
                  )
                })
              ) : (
                <p className="text-muted-foreground">No images found.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </main>
  )
}
