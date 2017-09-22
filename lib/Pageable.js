const DEFAULT_PAGE = 0;
const DEFAULT_PAGE_SIZE = 100;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 100;

let safeParseInt = (input, defaultValue) => {
    let val = parseInt(input || defaultValue, 10);
    if (isNaN(val)) {
        val = defaultValue;
    }
    return val;
};

class Pageable {
    constructor(page, pageSize) {
        this._page = this._checkPage(safeParseInt(page, DEFAULT_PAGE));
        this._size = this._checkPageSize(safeParseInt(pageSize, DEFAULT_PAGE_SIZE));
    }

    _checkPage = (page) => Math.max(page, 0);
    _checkPageSize = (pageSize) => Math.min(Math.max(pageSize, MIN_PAGE_SIZE), MAX_PAGE_SIZE);

    page = () => this._page;
    pageSize = () => this._size;

    limit = () => this.pageSize();
    offset = () => this.pageSize() * this.page();
}

module.exports = Pageable;