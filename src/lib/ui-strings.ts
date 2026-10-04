export const UI_STRINGS = Object.freeze({
  breadcrumb: Object.freeze({
    /** Name of the <nav> landmark. */
    landmark: "Breadcrumb",
    /** Announced for the collapsed middle of the trail. */
    ellipsis: "More",
  }),
  carousel: Object.freeze({
    previous: "Previous slide",
    next: "Next slide",
  }),
  combobox: Object.freeze({
    /** The caret button that opens the list. */
    trigger: "Open list",
    clear: "Clear selection",
    /** The button that removes a chip from a multiple selection: it names the item. */
    remove: (item: string) => `Remove ${item}`,
  }),
  command: Object.freeze({
    /** Visually hidden title and description of CommandDialog: they name the dialog. */
    dialogTitle: "Command palette",
    dialogDescription: "Search for a command to run…",
  }),
  dialog: Object.freeze({
    close: "Close",
  }),
  illustration: Object.freeze({
    /** Fallback alternative text; a decorative image should pass alt="". */
    alt: "Illustration",
  }),
  messageScroller: Object.freeze({
    /** Name of the scrollable region that holds the conversation. */
    viewport: "Messages",
    /** Screen-reader text of the button that jumps to the latest message. */
    scrollToEnd: "Scroll to end",
    /** Screen-reader text of the button that jumps to the first message. */
    scrollToStart: "Scroll to start",
  }),
  pagination: Object.freeze({
    /** Name of the <nav> landmark. */
    landmark: "Pagination",
    previousText: "Previous",
    previousLabel: "Go to previous page",
    nextText: "Next",
    nextLabel: "Go to next page",
    /** Announced for the skipped range of pages. */
    ellipsis: "More pages",
  }),
  passwordInput: Object.freeze({
    show: "Show password",
    hide: "Hide password",
  }),
  questionnaire: Object.freeze({
    /** Name of the progress bar ("Question 2 of 5" is its value text). */
    progress: "Questionnaire progress",
    previous: "Previous",
    skip: "Skip",
    next: "Next",
    submit: "Submit",
  }),
  sheet: Object.freeze({
    close: "Close",
  }),
  sidebar: Object.freeze({
    toggle: "Show or hide the sidebar",
    /** Title of the sheet the sidebar becomes on mobile; screen readers only. */
    mobileTitle: "Sidebar",
    /** Description of that sheet; screen readers only. */
    mobileDescription: "Displays the mobile sidebar.",
  }),
  spinner: Object.freeze({
    /** Name of the role="status" region. */
    label: "Loading",
  }),
})

export type UiStrings = typeof UI_STRINGS
