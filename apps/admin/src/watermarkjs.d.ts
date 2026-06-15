declare module 'watermarkjs' {
  type Resource = string | File | Blob | HTMLImageElement
  type Draw = (...resources: HTMLCanvasElement[]) => HTMLCanvasElement

  interface Options {
    type?: string
    encoderOptions?: number
    init?: (image: HTMLImageElement) => void
  }

  interface Result<TResult> extends PromiseLike<TResult> {
    blob(draw: Draw): Result<Blob>
  }

  interface Watermark {
    (resources: Resource[], options?: Options): Result<Resource[]>
    image: {
      center(alpha?: number): Draw
    }
    destroy(): void
  }

  const watermark: Watermark
  export default watermark
}
