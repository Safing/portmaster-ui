import { Component, HostBinding, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { fadeInAnimation, fadeInListAnimation } from 'src/app/shared/animations';
import { FuzzySearchService } from 'src/app/shared/fuzzySearch';
import { SupportType, supportTypes } from './pages';

@Component({
  templateUrl: './support.html',
  styleUrls: ['./support.scss'],
  animations: [
    fadeInListAnimation,
    fadeInAnimation,
  ]
})
export class SupportPageComponent {
  // make supportTypes available in the page template.
  readonly supportTypes = supportTypes;

  /** @private The current search term for the settings. */
  searchTerm: string = '';

  constructor(
    private router: Router,
    private searchService: FuzzySearchService,
  ) { }

  search(searchTerm: string) {
    this.searchTerm = searchTerm;
    const allTypes: SupportType[] = [];
    this.supportTypes.forEach(pages => pages.choices.forEach(choice => {
      allTypes.push(choice);
    }))

    // Use fuzzy-search to limit the number of settings shown.
    const filtered = this.searchService.searchList(supportTypes, searchTerm, {
      ignoreLocation: true,
      ignoreFieldNorm: true,
      threshold: 0.1,
      minMatchCharLength: 3,
      keys: [
        { name: ['choices', 'title'], weight: 3 },
        { name: ['choices', 'shortHelp'], weight: 2 },
        { name: ['choices', 'epilogue'], weight: 1 },
        { name: ['choices', 'prologue'], weight: 1 },
      ]
    })
    console.log(filtered);
    // The search service wraps the items in a search-result object.
    // Unwrap them now.
    let items = filtered
      .map(res => res.item);

  }

  openPage(item: SupportType) {
    if (item.type === 'link') {
      if (!!window.app) {
        window.app.openExternal(item.url);
      } {
        window.open(item.url, '_blank');
      }
      return;
    }
    this.router.navigate(['/support', item.id]);
  }
}

