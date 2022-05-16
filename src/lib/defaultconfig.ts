export const defaultconfig = {
  // External data
  url: null,
  // Data
  // data,
  // Copy behavior
  copyCompatibility: false,
  root: null,
  // Rows and columns definitions
  // rows: [],
  // columns,
  // Deprected legacy options
  colHeaders: [],
  colWidths: [],
  colAlignments: [],
  nestedHeaders: null,
  // Column width that is used by default
  defaultColWidth: 50,
  defaultColAlign: "center",
  // Spare rows and columns
  minSpareRows: 0,
  minSpareCols: 0,
  // Minimal table dimensions
  minDimensions: [0, 0],
  // Allow Export
  allowExport: true,
  // @type {boolean} - Include the header titles on download
  includeHeadersOnDownload: false,
  // @type {boolean} - Include the header titles on copy
  includeHeadersOnCopy: false,
  // Allow column sorting
  columnSorting: true,
  // Allow column dragging
  columnDrag: false,
  // Allow column resizing
  columnResize: true,
  // Allow row resizing
  rowResize: false,
  // Allow row dragging
  rowDrag: true,
  // Allow table edition
  editable: true,
  // Allow new rows
  allowInsertRow: true,
  // Allow new rows
  allowManualInsertRow: true,
  // Allow new columns
  allowInsertColumn: true,
  // Allow new rows
  allowManualInsertColumn: true,
  // Allow row delete
  allowDeleteRow: true,
  // Allow deleting of all rows
  allowDeletingAllRows: false,
  // Allow column delete
  allowDeleteColumn: true,
  // Allow rename column
  allowRenameColumn: true,
  // Allow comments
  allowComments: false,
  // Global wrap
  wordWrap: false,
  // Image options
  imageOptions: null,
  // CSV source
  csv: null,
  // Filename
  csvFileName: "jexcel",
  // Consider first line as header
  csvHeaders: true,
  // Delimiters
  csvDelimiter: ",",
  // First row as header
  parseTableFirstRowAsHeader: false,
  parseTableAutoCellType: false,
  // Disable corner selection
  selectionCopy: true,
  // Merged cells
  // mergeCells: {},
  // Create toolbar
  toolbar: null,
  // Allow search
  search: false,
  // Create pagination
  pagination: false,
  paginationOptions: null,
  // Full screen
  fullscreen: false,
  // Lazy loading
  lazyLoading: false,
  loadingSpin: false,
  // Table overflow
  tableOverflow: false,
  tableHeight: "300px",
  tableWidth: null,
  // Meta
  meta: null,
  // Style
  style: null,
  // Execute formulas
  parseFormulas: true,
  autoIncrement: true,
  autoCasting: true,
  // Security
  secureFormulas: true,
  stripHTML: true,
  stripHTMLOnCopy: false,
  // Filters
  filters: false,
  footers: null,
  // Event handles
  onundo: null,
  onredo: null,
  onload: null,
  onchange: null,
  oncomments: null,
  onbeforechange: null,
  onafterchanges: null,
  onbeforeinsertrow: null,
  oninsertrow: null,
  onbeforeinsertcolumn: null,
  oninsertcolumn: null,
  onbeforedeleterow: null,
  ondeleterow: null,
  onbeforedeletecolumn: null,
  ondeletecolumn: null,
  onmoverow: null,
  onmovecolumn: null,
  onresizerow: null,
  onresizecolumn: null,
  onsort: null,
  onselection: null,
  oncopy: null,
  onpaste: null,
  onbeforepaste: null,
  onmerge: null,
  onfocus: null,
  onblur: null,
  onchangeheader: null,
  oncreateeditor: null,
  oneditionstart: null,
  oneditionend: null,
  onchangestyle: null,
  onchangemeta: null,
  onchangepage: null,
  onbeforesave: null,
  onsave: null,
  // Global event dispatcher
  onevent: null,
  // Persistance
  persistance: false,
  // Customize any cell behavior
  updateTable: null,
  // Detach the HTML table when calling updateTable
  detachForUpdates: false,
  freezeColumns: null,
  // Texts
  text: {
    noRecordsFound: "No records found",
    showingPage: "Showing page {0} of {1} entries",
    show: "Show ",
    search: "Search",
    entries: " entries",
    columnName: "Column name",
    insertANewColumnBefore: "Insert a new column before",
    insertANewColumnAfter: "Insert a new column after",
    deleteSelectedColumns: "Delete selected columns",
    renameThisColumn: "Rename this column",
    orderAscending: "Order ascending",
    orderDescending: "Order descending",
    insertANewRowBefore: "Insert a new row before",
    insertANewRowAfter: "Insert a new row after",
    deleteSelectedRows: "Delete selected rows",
    editComments: "Edit comments",
    addComments: "Add comments",
    comments: "Comments",
    clearComments: "Clear comments",
    copy: "Copy...",
    paste: "Paste...",
    saveAs: "Save as...",
    about: "About",
    areYouSureToDeleteTheSelectedRows:
      "Are you sure to delete the selected rows?",
    areYouSureToDeleteTheSelectedColumns:
      "Are you sure to delete the selected columns?",
    thisActionWillDestroyAnyExistingMergedCellsAreYouSure:
      "This action will destroy any existing merged cells. Are you sure?",
    thisActionWillClearYourSearchResultsAreYouSure:
      "This action will clear your search results. Are you sure?",
    thereIsAConflictWithAnotherMergedCell:
      "There is a conflict with another merged cell",
    invalidMergeProperties: "Invalid merged properties",
    cellAlreadyMerged: "Cell already merged",
    noCellsSelected: "No cells selected",
  },
};

export type Config = typeof defaultconfig;
