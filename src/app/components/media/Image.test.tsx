import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Image } from "./Image";
import { gzipSync } from "node:zlib";

const lottieJson = JSON.stringify({
  v: "5.8.0",
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "demo",
  ddd: 0,
  assets: [],
  layers: [],
});

describe("Image", () => {
  it("renders a regular img for non-lottie sources", () => {
    render(<Image src="data:image/png;base64,ZmFrZQ==" alt="demo" />);

    const image = screen.getByAltText("demo");
    expect(image.tagName).toBe("IMG");
    expect(image).toHaveAttribute("src", "data:image/png;base64,ZmFrZQ==");
  });

  it("uses the lottie renderer for gzipped lottie data", async () => {
    const gzipped = Buffer.from(gzipSync(lottieJson)).toString("base64");
    render(
      <Image src={`data:application/gzip;base64,${gzipped}`} alt="demo" />,
    );

    const rendered = await screen.findByLabelText("demo");
    expect(rendered).toBeInTheDocument();
  });
});
