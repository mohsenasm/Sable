import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ImgHTMLAttributes } from 'react';
import { ImageViewer } from './ImageViewer';

vi.mock('$components/media', () => ({
  Image: ({ alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) => <img alt={alt} {...props} />,
}));

vi.mock('$hooks/useImageGestures', () => ({
  useImageGestures: () => ({
    transforms: { zoom: 1, pan: { x: 0, y: 0 } },
    cursor: 'initial',
    handleWheel: () => {},
    onPointerDown: () => {},
    resetTransforms: () => {},
    zoomIn: () => {},
    zoomOut: () => {},
    setZoom: () => {},
    fitRatio: 1,
    imageRef: { current: null },
    containerRef: { current: null },
    handleImageLoad: () => {},
    enableResizeWithWindow: () => {},
  }),
}));

describe('ImageViewer', () => {
  it('renders the fullscreen image without crashing', () => {
    render(<ImageViewer alt="demo" src="https://example.com/demo.png" requestClose={() => {}} />);

    expect(screen.getByAltText('demo')).toBeInTheDocument();
  });
});
