declare module "epubjs" {
  interface RenditionOptions {
    width?: string | number;
    height?: string | number;
    flow?: "paginated" | "scrolled" | "scrolled-doc" | "scrolled-continuous";
    spread?: string;
    stylesheet?: string;
    allowScriptedContent?: boolean;
  }

  interface LocationPoint {
    cfi: string;
    href: string;
    index: number;
    location: number;
    percentage: number;
    displayed: { page: number; total: number };
  }

  interface Location {
    start: LocationPoint;
    end: LocationPoint;
    atEnd: boolean;
    atStart: boolean;
  }

  interface Locations {
    generate(chars: number): Promise<string[]>;
    percentageFromCfi(cfi: string): number;
    cfiFromPercentage(pct: number): string;
    cfiFromLocation(loc: number): string;
    currentLocation(): Location;
    length(): number;
  }

  interface Themes {
    register(name: string, styles: Record<string, Record<string, string>>): void;
    select(name: string): void;
    fontSize(size: string): void;
    font(name: string): void;
  }

  interface Contents {
    window: Window;
    document: Document;
  }

  interface Hook {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    register(fn: (contents: any) => void): void;
  }

  interface Annotations {
    highlight(
      cfiRange: string,
      data?: Record<string, unknown>,
      cb?: undefined,
      className?: string,
      styles?: Record<string, string>
    ): void;
  }

  interface Rendition {
    themes: Themes;
    annotations: Annotations;
    hooks: { content: Hook; [key: string]: Hook };
    getContents(): Contents[];
    display(target?: string): Promise<void>;
    next(): Promise<void>;
    prev(): Promise<void>;
    on(event: "relocated", cb: (loc: Location) => void): void;
    on(event: "selected", cb: (cfiRange: string, contents: Contents) => void): void;
    on(event: "click", cb: (e: MouseEvent) => void): void;
    on(event: string, cb: (...args: unknown[]) => void): void;
    destroy(): void;
  }

  interface Book {
    renderTo(element: Element, options?: RenditionOptions): Rendition;
    locations: Locations;
    destroy(): void;
  }

  function ePub(url: string | ArrayBuffer, options?: Record<string, unknown>): Book;
  export = ePub;
}
