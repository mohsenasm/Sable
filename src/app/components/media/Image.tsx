import type {
  ComponentProps,
  ImgHTMLAttributes,
  PointerEvent as ReactPointerEvent,
  SyntheticEvent,
} from "react";
import { forwardRef, useEffect, useState } from "react";
import classNames from "classnames";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useSetting } from "$state/hooks/settings";
import { isPixelatedRendering, settingsAtom } from "$state/settings";
import * as css from "./media.css";
import type { IImageInfo } from "$types/matrix/common";

type ImageProps = ImgHTMLAttributes<HTMLImageElement> & { info?: IImageInfo };

type LottieDotProps = Omit<
  ComponentProps<typeof DotLottieReact>,
  "src" | "alt" | "loading"
>;

async function resolveLottieDataUrl(src: string): Promise<string | null> {
  const dataUrlMatch = src.match(/^data:([^;,]+)?;base64,(.+)$/i);
  if (!dataUrlMatch) {
    return null;
  }

  const [, , encoded] = dataUrlMatch;
  if (typeof encoded !== "string" || encoded.length === 0) {
    return null;
  }

  const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));

  if (bytes.length < 2 || bytes[0] !== 0x1f || bytes[1] !== 0x8b) {
    return null;
  }

  try {
    const stream = new Blob([bytes])
      .stream()
      .pipeThrough(new DecompressionStream("gzip"));
    const decompressed = await new Response(stream).arrayBuffer();
    const jsonText = new TextDecoder().decode(decompressed);
    const json = JSON.parse(jsonText);

    if (json && typeof json === "object" && "v" in json) {
      return `data:application/json;charset=utf-8,${encodeURIComponent(jsonText)}`;
    }
  } catch {
    return null;
  }

  return null;
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      className,
      alt,
      info,
      loading = "lazy",
      onLoad,
      onPointerDown,
      src,
      style,
      ...props
    },
    ref,
  ) => {
    const [pixelatedImageRendering] = useSetting(
      settingsAtom,
      "pixelatedImageRendering",
    );
    const [resolvedLottieSrc, setResolvedLottieSrc] = useState<
      string | null | undefined
    >(undefined);

    const lottieProps = props as LottieDotProps;
    const lottieOnLoad = onLoad
      ? (event: SyntheticEvent<HTMLCanvasElement>) =>
          onLoad(event as unknown as SyntheticEvent<HTMLImageElement>)
      : undefined;
    const lottieOnPointerDown = onPointerDown
      ? (event: ReactPointerEvent<HTMLCanvasElement>) =>
          onPointerDown(event as unknown as ReactPointerEvent<HTMLImageElement>)
      : undefined;

    useEffect(() => {
      let cancelled = false;

      if (typeof src === "string" && src.startsWith("data:")) {
        void resolveLottieDataUrl(src).then((result) => {
          if (!cancelled) {
            setResolvedLottieSrc(result);
          }
        });
      } else {
        setResolvedLottieSrc(null);
      }

      return () => {
        cancelled = true;
      };
    }, [src]);

    const shouldRenderLottie = typeof resolvedLottieSrc === "string";

    if (shouldRenderLottie) {
      return (
        <DotLottieReact
          {...lottieProps}
          className={classNames(
            css.Image,
            isPixelatedRendering(pixelatedImageRendering, info) &&
              css.ImagePixelated,
            className,
          )}
          style={style}
          src={resolvedLottieSrc}
          aria-hidden={props["aria-hidden"]}
          onLoad={lottieOnLoad}
          onPointerDown={lottieOnPointerDown}
        />
      );
    }

    return (
      <img
        className={classNames(
          css.Image,
          isPixelatedRendering(pixelatedImageRendering, info) &&
            css.ImagePixelated,
          className,
        )}
        alt={alt}
        loading={loading}
        src={src}
        style={style}
        onLoad={onLoad}
        onPointerDown={onPointerDown}
        {...props}
        ref={ref}
      />
    );
  },
);
