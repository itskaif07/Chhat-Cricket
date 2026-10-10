import { DOCUMENT, Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class SeoService {

  private readonly baseUrl = 'https://chhat-cricket.web.app';

  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document
  ) { }

  setPage(title: string, description: string, path: string): void {
    const url = new URL(path, this.baseUrl).href;

    this.title.setTitle(title);

    this.meta.updateTag({
      name: 'description',
      content: description
    });

    this.meta.updateTag({
      property: 'og:title',
      content: title
    });

    this.meta.updateTag({
      property: 'og:description',
      content: description
    });

    this.meta.updateTag({
      property: 'og:url',
      content: url
    });

    let canonical =
      this.document.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]'
      );

    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }

    canonical.href = url;
  }
}
