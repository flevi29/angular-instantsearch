import { Component, Input } from "@angular/core";
import { connectPagination } from "instantsearch.js/es/connectors";
import { noop, range } from "lodash";

import BaseWidget from "../base-widget";
import { NgISInstance } from "../instantsearch/instantsearch-instance";
import { bem } from "../utils";

const cx = bem("Pagination");

@Component({
  selector: "ngis-pagination",
  templateUrl: "./pagination.html"
})
export class NgISPagination extends BaseWidget {
  // render options
  @Input() public showFirst: boolean = true;
  @Input() public showLast: boolean = false;
  @Input() public showPrevious: boolean = true;
  @Input() public showNext: boolean = true;
  @Input() public pagesPadding: number | string = 3;

  // connector options
  @Input() public maxPages?: number | string;

  public state = {
    createURL: noop,
    currentRefinement: 0,
    nbHits: 0,
    nbPages: 0,
    refine: noop
  };

  // we use external template, we need the reference
  // of the cx() util on the Pagination class
  public cx = cx;

  get pages() {
    const { nbPages, currentRefinement } = this.state;

    const pagesArray = Array.apply(null, { length: nbPages }).map(
      Number.call,
      Number
    );

    const pagesPadding =
      typeof this.pagesPadding === "string"
        ? parseInt(this.pagesPadding, 10)
        : this.pagesPadding;

    if (pagesPadding && pagesPadding > 0) {
      const minDelta = currentRefinement - pagesPadding - 1;
      const maxDelta = currentRefinement + pagesPadding + 1;

      if (minDelta < 0) {
        return range(0, currentRefinement + pagesPadding + Math.abs(minDelta));
      } else if (maxDelta > nbPages) {
        return range(
          currentRefinement - pagesPadding - (maxDelta - nbPages),
          nbPages
        );
      } else {
        return range(
          currentRefinement - pagesPadding,
          currentRefinement + pagesPadding + 1
        );
      }
    }

    return pagesArray;
  }

  constructor(searchInstance: NgISInstance) {
    super(searchInstance);
  }

  public ngOnInit() {
    this.createWidget(connectPagination, {
      maxPages:
        typeof this.maxPages === "string"
          ? parseInt(this.maxPages, 10)
          : this.maxPages
    });
    super.ngOnInit();
  }

  public refine(event, page: number) {
    event.stopPropagation();
    event.preventDefault();

    if (page < this.state.nbPages && page >= 0) {
      this.state.refine(page);
    }
  }
}
